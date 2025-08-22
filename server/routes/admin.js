const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { adminAuth } = require('../middleware/auth');
const { User, Permit, County, Checklist, sequelize } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// All routes require admin authentication
router.use(adminAuth);

// Get all users with pagination and filtering
router.get('/users', async (req, res) => {
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
router.post('/users', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1, max: 50 }),
  body('lastName').trim().isLength({ min: 1, max: 50 }),
  body('company').optional().trim(),
  body('phone').optional().trim(),
  body('role').isIn(['user', 'admin']),
  body('isActive').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, company, phone, role, isActive } = req.body;

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
router.put('/users/:id', [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('company').optional().trim(),
  body('phone').optional().trim(),
  body('role').optional().isIn(['user', 'admin']),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
router.put('/users/:id/password', [
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
router.get('/activity', [
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
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

module.exports = router;
