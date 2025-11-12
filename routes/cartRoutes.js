const express = require('express');
const router = express.Router();
const cartModel = require('../models/cartModel');
const { verifyToken } = require('../utils/auth');

// 🛒 Get all items in the user's cart
router.get('/', verifyToken, async (req, res) => {
  try {
    const items = await cartModel.getCartItems(req.user.id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cart items', error: err.message });
  }
});

// 🛒 Add a product to the cart
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const cart_id = await cartModel.addToCart(req.user.id, product_id, quantity);
    res.status(201).json({ message: 'Product added to cart', cart_id });
  } catch (err) {
    res.status(500).json({ message: 'Error adding to cart', error: err.message });
  }
});

// 🛒 Update quantity of a cart item
router.put('/update', verifyToken, async (req, res) => {
  try {
    const { cart_id, quantity } = req.body;
    await cartModel.updateCartItem(cart_id, quantity);
    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating cart', error: err.message });
  }
});

// 🛒 Remove an item from the cart
router.delete('/remove/:cart_id', verifyToken, async (req, res) => {
  try {
    const cart_id = req.params.cart_id;
    await cartModel.removeCartItem(cart_id);
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing cart item', error: err.message });
  }
});

// 🛒 Clear the entire cart
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    await cartModel.clearCart(req.user.id);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Error clearing cart', error: err.message });
  }
});

module.exports = router;
