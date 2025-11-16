const express = require('express');
const router = express.Router();
const Category = require('../models/categoryModel');
const { verifyToken, authorizeRoles } = require('../utils/auth');

// GET all categories
router.get('/', async (req,res)=> { const c=await Category.getAll(); res.json(c); });

// Admin: create
router.post('/', verifyToken, authorizeRoles('admin'), async (req,res)=> { const cat=await Category.create(req.body.name, req.body.description); res.json(cat); });

// Admin: update
router.put('/:id', verifyToken, authorizeRoles('admin'), async (req,res)=> { const cat=await Category.update(req.params.id, req.body.name, req.body.description); res.json(cat); });

// Admin: delete
router.delete('/:id', verifyToken, authorizeRoles('admin'), async (req,res)=> { const r=await Category.delete(req.params.id); res.json(r); });

module.exports = router;
