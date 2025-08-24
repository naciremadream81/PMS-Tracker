const express = require('express');
const { adminAuth } = require('../middleware/auth');
const { User, Permit, County, Checklist, sequelize } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// All routes require admin authentication
router.use(adminAuth);

// Get all users with pagination and filtering
router.get('/users', async (req, res) => {
  console.log('GET /users route hit with query:', req.query);
  try {
    const {
      page = 1,
      limit = 20,
      role,
      isActive,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (role && role !== '') whereClause.role = role;
    if (isActive !== undefined && isActive !== '') {
      whereClause.isActive = isActive === 'true';
    }
    if (search && search.trim() !== '') {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search.trim()}%` } },
        { lastName: { [Op.iLike]: `%${search.trim()}%` } },
        { email: { [Op.iLike]: `%${search.trim()}%` } },
        { company: { [Op.iLike]: `%${search.trim()}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Permit,
        as: 'permits',
        attributes: ['id', 'projectName', 'status', 'created_at']
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// Create new user
router.post('/users', async (req, res) => {
  try {
    const { email, password, firstName, lastName, company, phone, role, isActive } = req.body;

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, password, first name, and last name are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either "user" or "admin".' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      company,
      phone,
      role,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      message: 'User created successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Failed to create user.' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Prevent admin from deactivating themselves
    if (user.id === req.user.id && req.body.isActive === false) {
      return res.status(400).json({ error: 'Cannot deactivate your own account.' });
    }

    await user.update(req.body);

    res.json({
      message: 'User updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account.' });
    }

    // Check if user has permits
    const permitCount = await Permit.count({ where: { userId: user.id } });
    if (permitCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete user with existing permits. Deactivate instead.' 
      });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// Change user password
router.put('/users/:id/password', async (req, res) => {
  try {

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await user.update({ password: req.body.newPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalPermits,
      totalCounties,
      totalChecklists
    ] = await Promise.all([
      User.count(),
      User.count({ where: { isActive: true } }),
      Permit.count(),
      County.count(),
      Checklist.count()
    ]);

    // Get permit status breakdown
    const permitStatuses = await Permit.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Get user role breakdown
    const userRoles = await User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['role']
    });

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        byRole: userRoles
      },
      permits: {
        total: totalPermits,
        byStatus: permitStatuses
      },
      counties: totalCounties,
      checklists: totalChecklists
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics.' });
  }
});

// Get recent activity
router.get('/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const recentPermits = await Permit.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email']
      }],
      order: [['created_at', 'DESC']],
      limit
    });

    const recentUsers = await User.findAll({
      attributes: ['firstName', 'lastName', 'email', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: Math.floor(limit / 2)
    });

    res.json({
      recentPermits,
      recentUsers
    });
  } catch (error) {
    console.error('Activity fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity.' });
  }
});

// County Checklist Management

// Get all counties with their checklists
router.get('/counties', async (req, res) => {
  try {
    const counties = await County.findAll({
      include: [{
        model: Checklist,
        as: 'checklists',
        attributes: ['id', 'name', 'description', 'category', 'isActive', 'order']
      }],
      order: [['name', 'ASC'], [{ model: Checklist, as: 'checklists' }, 'order', 'ASC']]
    });

    res.json({ counties });
  } catch (error) {
    console.error('Counties fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch counties.' });
  }
});

// Get checklists for a specific county
router.get('/counties/:countyId/checklists', async (req, res) => {
  try {
    const { countyId } = req.params;
    
    const checklists = await Checklist.findAll({
      where: { countyId },
      order: [['order', 'ASC'], ['name', 'ASC']]
    });

    res.json({ checklists });
  } catch (error) {
    console.error('County checklists fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch county checklists.' });
  }
});

// Create new checklist for a county
router.post('/counties/:countyId/checklists', async (req, res) => {
  try {
    const { countyId } = req.params;
    const { name, description, category, projectTypes, estimatedCost, processingTime, isActive, order } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({ error: 'Checklist name is required.' });
    }

    const checklist = await Checklist.create({
      name,
      description,
      category: category || 'general',
      projectTypes: projectTypes || [],
      estimatedCost: estimatedCost || 0,
      processingTime: processingTime || 'Unknown',
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
      countyId
    });

    res.status(201).json({ checklist });
  } catch (error) {
    console.error('Checklist creation error:', error);
    res.status(500).json({ error: 'Failed to create checklist.' });
  }
});

// Update checklist
router.put('/checklists/:checklistId', async (req, res) => {
  try {
    const { checklistId } = req.params;
    const { name, description, category, projectTypes, estimatedCost, processingTime, isActive, order } = req.body;

    const checklist = await Checklist.findByPk(checklistId);
    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found.' });
    }

    await checklist.update({
      name: name || checklist.name,
      description: description !== undefined ? description : checklist.description,
      category: category || checklist.category,
      projectTypes: projectTypes !== undefined ? projectTypes : checklist.projectTypes,
      estimatedCost: estimatedCost !== undefined ? estimatedCost : checklist.estimatedCost,
      processingTime: processingTime || checklist.processingTime,
      isActive: isActive !== undefined ? isActive : checklist.isActive,
      order: order !== undefined ? order : checklist.order
    });

    res.json({ checklist });
  } catch (error) {
    console.error('Checklist update error:', error);
    res.status(500).json({ error: 'Failed to update checklist.' });
  }
});

// Delete checklist
router.delete('/checklists/:checklistId', async (req, res) => {
  try {
    const { checklistId } = req.params;

    const checklist = await Checklist.findByPk(checklistId);
    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found.' });
    }

    await checklist.destroy();
    res.json({ message: 'Checklist deleted successfully.' });
  } catch (error) {
    console.error('Checklist deletion error:', error);
    res.status(500).json({ error: 'Failed to delete checklist.' });
  }
});

module.exports = router;
