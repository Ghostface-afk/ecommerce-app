const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../utils/auth');
const Product = require('../models/productModel');

// Upload product image separately
router.post('/upload-image', verifyToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const { image_file, fileName } = req.body;
        const result = await Product.uploadImage({ image_file, fileName });
        res.json({ message: "Image uploaded successfully", url: result.url });
    } catch (err) {
        res.status(400).json({ message: "Image upload failed", error: err.message });
    }
});

// Admin: create product
router.post('/products', verifyToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ message: "Product created", product });
    } catch (err) {
        res.status(400).json({ message: "Product creation failed", error: err.message });
    }
});

// Admin: update product
router.put('/products/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const product = await Product.update(req.params.id, req.body);
        res.json({ message: "Product updated", product });
    } catch (err) {
        res.status(400).json({ message: "Product update failed", error: err.message });
    }
});

// Admin: delete product
router.delete('/products/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const result = await Product.delete(req.params.id);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: "Product deletion failed", error: err.message });
    }
});

module.exports = router;
