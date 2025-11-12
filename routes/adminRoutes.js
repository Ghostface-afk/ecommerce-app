const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../utils/auth');
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const orderModel = require('../models/orderModel');

// Middleware: Only admins
router.use(verifyToken, authorizeRoles('admin'));

// -------------------
// PRODUCTS MANAGEMENT
// -------------------

// Add new product
router.post('/products', async (req, res) => {
  try {
    const { name, description, category_id, price, stock_quantity, image_url, status } = req.body;
    const product_id = await productModel.createProduct({ name, description, category_id, price, stock_quantity, image_url, status });
    res.status(201).json({ message: 'Product added', product_id });
  } catch (err) {
    res.status(500).json({ message: 'Error adding product', error: err.message });
  }
});

// Update existing product
router.put('/products/:id', async (req, res) => {
  try {
    const product_id = req.params.id;
    await productModel.updateProduct(product_id, req.body);
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const product_id = req.params.id;
    await productModel.deleteProduct(product_id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
});

// Update stock quantity
router.put('/products/:id/stock', async (req, res) => {
  try {
    const product_id = req.params.id;
    const { stock_quantity } = req.body;
    await productModel.updateStock(product_id, stock_quantity);
    res.json({ message: 'Stock updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating stock', error: err.message });
  }
});

// -------------------
// CATEGORIES MANAGEMENT
// -------------------

// Add category
router.post('/categories', async (req, res) => {
  try {
    const { category_name, description } = req.body;
    const category_id = await categoryModel.createCategory({ category_name, description });
    res.status(201).json({ message: 'Category added', category_id });
  } catch (err) {
    res.status(500).json({ message: 'Error adding category', error: err.message });
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const category_id = req.params.id;
    await categoryModel.updateCategory(category_id, req.body);
    res.json({ message: 'Category updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating category', error: err.message });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const category_id = req.params.id;
    await categoryModel.deleteCategory(category_id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting category', error: err.message });
  }
});

// -------------------
// ORDERS MANAGEMENT
// -------------------

// View all orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await orderModel.getAllOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
});

module.exports = router;
