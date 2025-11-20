const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../utils/auth');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

// Upload product image using ImageKit
router.post('/upload-image', verifyToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const { image_file, fileName } = req.body;
        
        if (!image_file) {
            return res.status(400).json({ message: "Image file is required" });
        }

        const result = await Product.uploadImage(image_file, fileName);
        res.json({ 
            message: "Image uploaded successfully", 
            url: result.url,
            fileId: result.fileId
        });
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
        res.json({ message: "Product deleted", result });
    } catch (err) {
        res.status(400).json({ message: "Product deletion failed", error: err.message });
    }
});

// Admin: create category
router.post('/categories', verifyToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.create(name, description);
        res.status(201).json({ message: "Category created", category });
    } catch (err) {
        res.status(400).json({ message: "Category creation failed", error: err.message });
    }
});

// In your adminRoutes.js - Add order status update
router.put('/orders/:orderId/status', verifyToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        // Update order status in database
        db.run(
            'UPDATE orders SET status = ? WHERE order_id = ?',
            [status, orderId],
            function(err) {
                if (err) {
                    return res.status(500).json({ message: 'Failed to update order status', error: err.message });
                }
                res.json({ message: 'Order status updated successfully' });
            }
        );
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;