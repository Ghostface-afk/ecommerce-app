const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');

// GET all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.getAll();
        res.json({ products });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch products", error: err.message });
    }
});

// GET product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.getById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json({ product });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch product", error: err.message });
    }
});

// CREATE product (Admin)
router.post('/', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ message: "Product created", product });
    } catch (err) {
        res.status(500).json({ message: "Failed to create product", error: err.message });
    }
});

// UPDATE product (Admin)
router.put('/:id', async (req, res) => {
    try {
        const updated = await Product.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product updated", updated });
    } catch (err) {
        res.status(500).json({ message: "Failed to update product", error: err.message });
    }
});

// DELETE product (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Product.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete product", error: err.message });
    }
});

module.exports = router;
