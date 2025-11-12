// models/orderModel.js
const db = require('../database');

const Order = {
  // Create a new order, optionally linked to a payment
  createOrder: (user_id, payment_id, total, status = 'pending') => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO orders (user_id, payment_id, total, status)
        VALUES (?, ?, ?, ?)
      `;
      db.run(sql, [user_id, payment_id, total, status], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  // Add items to an order
  addOrderItem: (order_id, product_id, quantity, price) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `;
      db.run(sql, [order_id, product_id, quantity, price], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  // Fetch a single order by ID
  getOrderById: (order_id) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM orders WHERE order_id = ?`;
      db.get(sql, [order_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Fetch all order items for a given order
  getOrderItems: (order_id) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT oi.*, p.name AS product_name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = ?
      `;
      db.all(sql, [order_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Fetch all orders for a user
  getOrdersByUser: (user_id) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT o.*, p.payment_method, p.status AS payment_status
        FROM orders o
        LEFT JOIN payments p ON o.payment_id = p.payment_id
        WHERE o.user_id = ?
        ORDER BY o.order_id DESC
      `;
      db.all(sql, [user_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Fetch all orders (admin)
  getAllOrders: () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT o.*, u.name AS customer_name, u.email, p.payment_method, p.status AS payment_status
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        LEFT JOIN payments p ON o.payment_id = p.payment_id
        ORDER BY o.order_id DESC
      `;
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Fetch full order details including items and payment info
  getOrderDetails: async (order_id) => {
    try {
      const order = await Order.getOrderById(order_id);
      if (!order) return null;

      const items = await Order.getOrderItems(order_id);
      const paymentSql = `SELECT * FROM payments WHERE order_id = ?`;
      const payment = await new Promise((resolve, reject) => {
        db.get(paymentSql, [order_id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      return { ...order, items, payment };
    } catch (err) {
      throw err;
    }
  }
};

module.exports = Order;
