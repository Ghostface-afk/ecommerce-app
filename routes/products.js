const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const { verifyToken, authorizeRoles } = require('../utils/auth');

// GET all products
router.get('/', async (req,res)=> { const products = await Product.getAll(); res.json(products); });

// GET product by id
router.get('/:id', async (req,res)=> { const p=await Product.getById(req.params.id); res.json(p||{message:'Not found'}); });

// Admin: create
router.post('/', verifyToken, authorizeRoles('admin'), async (req,res)=> { const prod = await Product.create(req.body); res.json(prod); });

// Admin: update
router.put('/:id', verifyToken, authorizeRoles('admin'), async (req,res)=> { const prod=await Product.update(req.params.id, req.body); res.json(prod); });

// Admin: delete
router.delete('/:id', verifyToken, authorizeRoles('admin'), async (req,res)=> { const r=await Product.delete(req.params.id); res.json(r); });

module.exports = router;
