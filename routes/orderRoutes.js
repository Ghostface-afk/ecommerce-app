const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const Payment = require('../models/paymentModel');
const Cart = require('../models/cartModel');
const { orderProcessingQueue } = require('../models/dataStructures');
const { verifyToken, authorizeRoles } = require('../utils/auth');

// Place order - adds to processing queue
router.post('/place', verifyToken, async (req, res) => {
  const user_id = req.user.id;
  const { payment_method = 'card' } = req.body;
  
  try {
    const cartItems = await Cart.getCartItems(user_id);
    if (!cartItems.length) return res.status(400).json({ message: 'Cart empty' });

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Create payment first
    const payment_id = await Payment.createPayment({
      order_id: null,
      amount: total,
      payment_method,
      status: 'pending'
    });

    // Create order
    const order_id = await Order.createOrder(user_id, payment_id, total, 'processing');
    
    // Add order items
    for (const item of cartItems) {
      await Order.addOrderItem(order_id, item.product_id, item.quantity, item.price);
    }

    // Add to processing queue
    const orderJob = {
      order_id,
      user_id,
      payment_id,
      total_amount: total,
      items: cartItems,
      timestamp: new Date()
    };
    
    orderProcessingQueue.enqueue(orderJob);
    console.log(`Order ${order_id} added to processing queue. Queue size: ${orderProcessingQueue.size()}`);

    // Update payment status
    await Payment.updatePaymentOrder(payment_id, order_id, 'completed');
    
    // Clear cart
    await Cart.clearCart(user_id);

    res.json({
      message: 'Order placed and queued for processing',
      order_id,
      total,
      queue_position: orderProcessingQueue.size()
    });

  } catch (err) {
    res.status(500).json({ message: 'Order placement failed', error: err.message });
  }
});

// Process next order in queue (Admin only)
router.post('/process-next', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const nextOrder = orderProcessingQueue.dequeue();
    
    if (!nextOrder) {
      return res.json({ message: 'No orders in queue' });
    }

    // Simulate order processing
    await Order.updateOrderStatus(nextOrder.order_id, 'completed');
    
    console.log(`Processed order ${nextOrder.order_id}. Remaining in queue: ${orderProcessingQueue.size()}`);
    
    res.json({
      message: 'Order processed successfully',
      order: nextOrder,
      remaining_in_queue: orderProcessingQueue.size()
    });

  } catch (err) {
    res.status(500).json({ message: 'Order processing failed', error: err.message });
  }
});

// Get queue status
router.get('/queue-status', verifyToken, authorizeRoles('admin'), async (req, res) => {
  const queueItems = [];
  let current = orderProcessingQueue.front();
  let tempQueue = new (require('../models/dataStructures').Queue)();
  let count = 0;

  // Safely get all items from queue without modifying it
  while (!orderProcessingQueue.isEmpty() && count < 100) {
    const item = orderProcessingQueue.dequeue();
    if (item) {
      queueItems.push({ ...item, position: queueItems.length + 1 });
      tempQueue.enqueue(item);
    }
    count++;
  }

  // Restore the original queue
  while (!tempQueue.isEmpty()) {
    const item = tempQueue.dequeue();
    orderProcessingQueue.enqueue(item);
  }

  res.json({
    queue_length: orderProcessingQueue.size(),
    orders_in_queue: queueItems
  });
});

// Existing routes
router.get('/my', verifyToken, async (req, res) => {
  const orders = await Order.getOrdersByUser(req.user.id);
  res.json(orders);
});

router.get('/:orderId', verifyToken, async (req, res) => {
  const orderDetails = await Order.getOrderDetails(req.params.orderId);
  res.json(orderDetails);
});

router.get('/', verifyToken, authorizeRoles('admin'), async (req, res) => {
  const orders = await Order.getAllOrders();
  res.json(orders);
});

module.exports = router;