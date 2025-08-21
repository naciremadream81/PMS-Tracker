const express = require('express');
const { query, validationResult } = require('express-validator');
const { County, Checklist } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Get all counties with optional filtering
router.get('/', [
  query('state').optional().isLength({ min: 2, max: 2 }),
  query('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { state, isActive } = req.query;
    const whereClause = {};

    if (state) whereClause.state = state.toUpperCase();
    if (isActive !== undefined) whereClause.isActive = isActive;

    const counties = await County.findAll({
      where: whereClause,
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'state', 'stateFull', 'website', 'phone', 'processingTime', 'isActive']
    });

    res.json({ counties });
  } catch (error) {
    console.error('Counties fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch counties.' });
  }
});

// Get single county by ID with checklists
router.get('/:id', async (req, res) => {
  try {
    const county = await County.findByPk(req.params.id, {
      include: [{
        model: Checklist,
        as: 'checklists',
        where: { isActive: true },
        required: false,
        order: [['order', 'ASC']]
      }]
    });

    if (!county) {
      return res.status(404).json({ error: 'County not found.' });
    }

    res.json({ county });
  } catch (error) {
    console.error('County fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch county.' });
  }
});

// Get counties by state
router.get('/state/:state', async (req, res) => {
  try {
    const { state } = req.params;
    
    if (state.length !== 2) {
      return res.status(400).json({ error: 'State must be a 2-character code.' });
    }

    const counties = await County.findAll({
      where: { 
        state: state.toUpperCase(),
        isActive: true 
      },
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'state', 'stateFull', 'website', 'phone', 'processingTime']
    });

    res.json({ counties });
  } catch (error) {
    console.error('Counties by state fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch counties by state.' });
  }
});

// Get all states
router.get('/states/all', async (req, res) => {
  try {
    const states = await County.findAll({
      attributes: ['state', 'stateFull'],
      group: ['state', 'stateFull'],
      order: [['state', 'ASC']]
    });

    res.json({ states });
  } catch (error) {
    console.error('States fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch states.' });
  }
});

module.exports = router;
