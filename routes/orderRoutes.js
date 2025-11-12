const express = require('express');
const router = express.Router();
const orderModel = require('../models/orderModel');
const paymentModel = require('../models/paymentModel');
const cartModel = require('../models/cartModel');
const { verifyToken, authorizeRoles } = require('../utils/auth');

// 🧾 Place a new order (with simulated payment)
router.post('/place', verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { payment_method } = req.body;

    // 1️⃣ Fetch cart items
    const cartItems = await cartModel.getCartItems(user_id);
    if (cartItems.length === 0)
      return res.status(400).json({ message: 'Cart is empty' });

    // 2️⃣ Calculate total
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 3️⃣ Create payment
    const payment_id = await paymentModel.createPayment({
      order_id: null,
      amount: total,
      payment_method,
      status: 'pending'
    });

    // Later, link payment to the order
await paymentModel.updatePaymentOrder(payment_id, order_id, 'completed');

    // 4️⃣ Create order
    const order_id = await orderModel.createOrder(user_id, payment_id, total, 'pending');

    // 5️⃣ Add order items
    for (const item of cartItems) {
      await orderModel.addOrderItem(order_id, item.product_id, item.quantity, item.price);
    }

    // 6️⃣ Update payment
    await paymentModel.updatePaymentOrder(payment_id, order_id, 'completed');

    // 7️⃣ Clear cart
    await cartModel.clearCart(user_id);

    res.status(201).json({
      message: '✅ Order placed successfully!',
      order_id,
      total,
      payment_status: 'completed'
    });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ message: err.message });
  }
});

// 🧍 User: view their orders
router.get('/my', verifyToken, async (req, res) => {
  try {
    const orders = await orderModel.getOrdersByUser(req.user.id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🧍 User: view order details
router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    const details = await orderModel.getOrderDetails(req.params.orderId);
    res.json(details);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🛠️ Admin: view all orders
router.get('/', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const orders = await orderModel.getAllOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
