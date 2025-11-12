const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { verifyToken } = require('../utils/auth');

// Place an order
router.post('/', verifyToken, async (req, res) => {
  const { payment_method } = req.body;
  try {
    const result = await Order.placeOrder({ user_id: req.user.id, payment_method });
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get user's orders
router.get('/', verifyToken, async (req, res) => {
  try {
    const orders = await Order.getOrdersByUser(req.user.id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
