// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { verifyToken, authorizeRoles } = require('../utils/auth');

// GET all products (public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET product by id
router.get('/:id', async (req, res) => {
  try {
    const p = await Product.getById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: create product
router.post('/', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const prod = await Product.create(req.body);
    res.json(prod);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: update product
router.put('/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const prod = await Product.update(req.params.id, req.body);
    res.json(prod);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: delete product
router.delete('/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const r = await Product.delete(req.params.id);
    res.json(r);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
