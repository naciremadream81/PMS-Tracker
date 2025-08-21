const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { auth } = require('../middleware/auth');
const { Permit, County, Checklist, PermitFile, PermitChecklist, User } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Get all permits for current user with pagination and filtering
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed']),
  query('countyId').optional().isUUID(),
  query('projectType').optional().isIn(['residential', 'commercial', 'industrial', 'renovation', 'new_construction']),
  query('search').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      status,
      countyId,
      projectType,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { userId: req.user.id };

    if (status) whereClause.status = status;
    if (countyId) whereClause.countyId = countyId;
    if (projectType) whereClause.projectType = projectType;
    if (search) {
      whereClause[Op.or] = [
        { projectName: { [Op.iLike]: `%${search}%` } },
        { permitNumber: { [Op.iLike]: `%${search}%` } },
        { projectAddress: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: permits } = await Permit.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: County,
          as: 'county',
          attributes: ['id', 'name', 'state']
        },
        {
          model: PermitFile,
          as: 'files',
          attributes: ['id', 'filename', 'fileType', 'isUploaded']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      permits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Permits fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch permits.' });
  }
});

// Get single permit by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const permit = await Permit.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        {
          model: County,
          as: 'county',
          attributes: ['id', 'name', 'state', 'website', 'phone', 'processingTime']
        },
        {
          model: PermitFile,
          as: 'files',
          attributes: ['id', 'filename', 'originalName', 'fileType', 'fileSize', 'isUploaded', 'uploadDate', 'description']
        },
        {
          model: Checklist,
          as: 'checklists',
          through: {
            attributes: ['isCompleted', 'completedDate', 'notes', 'priority', 'estimatedHours', 'actualHours']
          }
        }
      ]
    });

    if (!permit) {
      return res.status(404).json({ error: 'Permit not found.' });
    }

    res.json({ permit });
  } catch (error) {
    console.error('Permit fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch permit.' });
  }
});

// Create new permit
router.post('/', auth, [
  body('projectName').trim().isLength({ min: 1, max: 200 }),
  body('projectAddress').trim().notEmpty(),
  body('projectType').isIn(['residential', 'commercial', 'industrial', 'renovation', 'new_construction']),
  body('countyId').isUUID(),
  body('estimatedCost').optional().isFloat({ min: 0 }),
  body('description').optional().trim(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      projectName,
      projectAddress,
      projectType,
      countyId,
      estimatedCost,
      description,
      notes
    } = req.body;

    // Verify county exists
    const county = await County.findByPk(countyId);
    if (!county) {
      return res.status(400).json({ error: 'Invalid county selected.' });
    }

    // Generate permit number
    const permitNumber = `P-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const permit = await Permit.create({
      permitNumber,
      projectName,
      projectAddress,
      projectType,
      countyId,
      estimatedCost,
      description,
      notes,
      userId: req.user.id
    });

    // Get county checklists for this project type
    const checklists = await Checklist.findAll({
      where: {
        countyId,
        isActive: true,
        projectTypes: { [Op.contains]: [projectType] }
      },
      order: [['order', 'ASC']]
    });

    // Create permit-checklist associations
    if (checklists.length > 0) {
      const permitChecklists = checklists.map(checklist => ({
        permitId: permit.id,
        checklistId: checklist.id,
        priority: checklist.category === 'required' ? 'high' : 'medium'
      }));

      await PermitChecklist.bulkCreate(permitChecklists);
    }

    res.status(201).json({
      message: 'Permit created successfully',
      permit: await Permit.findByPk(permit.id, {
        include: [
          { model: County, as: 'county' },
          { model: Checklist, as: 'checklists' }
        ]
      })
    });
  } catch (error) {
    console.error('Permit creation error:', error);
    res.status(500).json({ error: 'Failed to create permit.' });
  }
});

// Update permit
router.put('/:id', auth, [
  body('projectName').optional().trim().isLength({ min: 1, max: 200 }),
  body('projectAddress').optional().trim().notEmpty(),
  body('projectType').optional().isIn(['residential', 'commercial', 'industrial', 'renovation', 'new_construction']),
  body('status').optional().isIn(['draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed']),
  body('estimatedCost').optional().isFloat({ min: 0 }),
  body('description').optional().trim(),
  body('notes').optional().trim(),
  body('submissionDate').optional().isISO8601(),
  body('approvalDate').optional().isISO8601(),
  body('expirationDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const permit = await Permit.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!permit) {
      return res.status(404).json({ error: 'Permit not found.' });
    }

    // Update permit
    await permit.update(req.body);

    res.json({
      message: 'Permit updated successfully',
      permit: await Permit.findByPk(permit.id, {
        include: [
          { model: County, as: 'county' },
          { model: Checklist, as: 'checklists' }
        ]
      })
    });
  } catch (error) {
    console.error('Permit update error:', error);
    res.status(500).json({ error: 'Failed to update permit.' });
  }
});

// Delete permit
router.delete('/:id', auth, async (req, res) => {
  try {
    const permit = await Permit.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!permit) {
      return res.status(404).json({ error: 'Permit not found.' });
    }

    // Only allow deletion of draft permits
    if (permit.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft permits can be deleted.' });
    }

    await permit.destroy();

    res.json({ message: 'Permit deleted successfully' });
  } catch (error) {
    console.error('Permit deletion error:', error);
    res.status(500).json({ error: 'Failed to delete permit.' });
  }
});

// Update checklist item status
router.put('/:id/checklist/:checklistId', auth, [
  body('isCompleted').isBoolean(),
  body('notes').optional().trim(),
  body('actualHours').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { checklistId } = req.params;
    const { isCompleted, notes, actualHours } = req.body;

    const permitChecklist = await PermitChecklist.findOne({
      where: {
        permitId: req.params.id,
        checklistId,
        '$permit.userId$': req.user.id
      },
      include: [{
        model: Permit,
        as: 'permit',
        where: { userId: req.user.id }
      }]
    });

    if (!permitChecklist) {
      return res.status(404).json({ error: 'Checklist item not found.' });
    }

    const updateData = { isCompleted };
    if (notes !== undefined) updateData.notes = notes;
    if (actualHours !== undefined) updateData.actualHours = actualHours;
    if (isCompleted) updateData.completedDate = new Date();

    await permitChecklist.update(updateData);

    res.json({
      message: 'Checklist item updated successfully',
      checklistItem: permitChecklist
    });
  } catch (error) {
    console.error('Checklist update error:', error);
    res.status(500).json({ error: 'Failed to update checklist item.' });
  }
});

module.exports = router;
