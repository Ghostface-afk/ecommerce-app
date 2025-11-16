const db = require('../database');

const Order = {
  createOrder: (user_id, payment_id, total_amount, status='pending') => {
    return new Promise((resolve, reject) => {
      db.run(`INSERT INTO orders (user_id, payment_id, total_amount, status) VALUES (?, ?, ?, ?)`,
        [user_id, payment_id, total_amount, status], function(err) {
          if (err) return reject(err);
          resolve(this.lastID);
        });
    });
  },

  addOrderItem: (order_id, product_id, quantity, price_at_purchase) => {
    return new Promise((resolve, reject) => {
      db.run(`INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)`,
        [order_id, product_id, quantity, price_at_purchase], function(err) {
          if (err) return reject(err);
          resolve(this.lastID);
        });
    });
  },

  getOrdersByUser: (user_id) => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM orders WHERE user_id=? ORDER BY order_date DESC`, [user_id], (err, rows) => (err ? reject(err) : resolve(rows)));
    });
  },

  getOrderDetails: (order_id) => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT o.*, oi.*, p.name AS product_name 
              FROM orders o 
              JOIN order_items oi ON o.order_id=oi.order_id 
              JOIN products p ON oi.product_id=p.product_id 
              WHERE o.order_id=?`, [order_id], (err, rows) => (err ? reject(err) : resolve(rows)));
    });
  },

  getAllOrders: () => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT o.*, u.name AS customer_name FROM orders o JOIN users u ON o.user_id=u.user_id ORDER BY o.order_date DESC`, [], (err, rows) => (err ? reject(err) : resolve(rows)));
    });
  }
};

module.exports = Order;
