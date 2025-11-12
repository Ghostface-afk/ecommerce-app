const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const { verifyToken } = require('../utils/auth');

// GET current user's cart
router.get('/', verifyToken, async (req, res) => {
  try {
    const cartItems = await Cart.getCartByUser(req.user.id);
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add item to cart
router.post('/', verifyToken, async (req, res) => {
  const { product_id, quantity } = req.body;
  try {
    const result = await Cart.addItem({ user_id: req.user.id, product_id, quantity });
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE remove item from cart
router.delete('/:cart_id', verifyToken, async (req, res) => {
  try {
    const result = await Cart.removeItem(req.params.cart_id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
//const db = require('../db');