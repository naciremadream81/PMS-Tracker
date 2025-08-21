const express = require('express');
const { query, validationResult } = require('express-validator');
const { Checklist, County } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Get all checklists with optional filtering
router.get('/', [
  query('countyId').optional().isUUID(),
  query('projectType').optional().isIn(['residential', 'commercial', 'industrial', 'renovation', 'new_construction']),
  query('category').optional().isIn(['required', 'optional', 'conditional']),
  query('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { countyId, projectType, category, isActive } = req.query;
    const whereClause = {};

    if (countyId) whereClause.countyId = countyId;
    if (category) whereClause.category = category;
    if (isActive !== undefined) whereClause.isActive = isActive;
    if (projectType) {
      whereClause.projectTypes = { [Op.contains]: [projectType] };
    }

    const checklists = await Checklist.findAll({
      where: whereClause,
      include: [{
        model: County,
        as: 'county',
        attributes: ['id', 'name', 'state']
      }],
      order: [['order', 'ASC'], ['name', 'ASC']]
    });

    res.json({ checklists });
  } catch (error) {
    console.error('Checklists fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch checklists.' });
  }
});

// Get checklists by county
router.get('/county/:countyId', async (req, res) => {
  try {
    const { countyId } = req.params;

    const checklists = await Checklist.findAll({
      where: { 
        countyId,
        isActive: true 
      },
      include: [{
        model: County,
        as: 'county',
        attributes: ['id', 'name', 'state', 'processingTime']
      }],
      order: [['order', 'ASC'], ['name', 'ASC']]
    });

    res.json({ checklists });
  } catch (error) {
    console.error('County checklists fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch county checklists.' });
  }
});

// Get checklists by project type
router.get('/project-type/:projectType', [
  query('countyId').optional().isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectType } = req.params;
    const { countyId } = req.query;

    if (!['residential', 'commercial', 'industrial', 'renovation', 'new_construction'].includes(projectType)) {
      return res.status(400).json({ error: 'Invalid project type.' });
    }

    const whereClause = {
      projectTypes: { [Op.contains]: [projectType] },
      isActive: true
    };

    if (countyId) whereClause.countyId = countyId;

    const checklists = await Checklist.findAll({
      where: whereClause,
      include: [{
        model: County,
        as: 'county',
        attributes: ['id', 'name', 'state']
      }],
      order: [['order', 'ASC'], ['name', 'ASC']]
    });

    res.json({ checklists });
  } catch (error) {
    console.error('Project type checklists fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch project type checklists.' });
  }
});

// Get checklist by ID
router.get('/:id', async (req, res) => {
  try {
    const checklist = await Checklist.findByPk(req.params.id, {
      include: [{
        model: County,
        as: 'county',
        attributes: ['id', 'name', 'state', 'website', 'phone']
      }]
    });

    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found.' });
    }

    res.json({ checklist });
  } catch (error) {
    console.error('Checklist fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch checklist.' });
  }
});

// Get checklist categories summary
router.get('/categories/summary', [
  query('countyId').optional().isUUID(),
  query('projectType').optional().isIn(['residential', 'commercial', 'industrial', 'renovation', 'new_construction'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { countyId, projectType } = req.query;
    const whereClause = { isActive: true };

    if (countyId) whereClause.countyId = countyId;
    if (projectType) {
      whereClause.projectTypes = { [Op.contains]: [projectType] };
    }

    const checklists = await Checklist.findAll({
      where: whereClause,
      attributes: ['category', 'estimatedCost', 'processingTime']
    });

    const summary = {
      required: { count: 0, totalCost: 0, totalTime: 0 },
      optional: { count: 0, totalCost: 0, totalTime: 0 },
      conditional: { count: 0, totalCost: 0, totalTime: 0 }
    };

    checklists.forEach(checklist => {
      const category = checklist.category;
      summary[category].count++;
      summary[category].totalCost += parseFloat(checklist.estimatedCost || 0);
      summary[category].totalTime += parseInt(checklist.processingTime || 0);
    });

    res.json({ summary });
  } catch (error) {
    console.error('Categories summary error:', error);
    res.status(500).json({ error: 'Failed to fetch categories summary.' });
  }
});

module.exports = router;
