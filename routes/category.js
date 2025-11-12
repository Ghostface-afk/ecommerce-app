// routes/categories.js
const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const { verifyToken, authorizeRoles } = require('../utils/auth');

// Public: list categories
router.get('/', async (req, res) => {
  try {
    const cats = await Category.getAll();
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: create category
router.post('/', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.json(cat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: update
router.put('/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const cat = await Category.update(req.params.id, req.body);
    res.json(cat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: delete
router.delete('/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const r = await Category.delete(req.params.id);
    res.json(r);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
