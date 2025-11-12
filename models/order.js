/**
 Handles the full checkout flow inside one method:

Reads the user’s cart

Calculates the total

Creates an order

Adds order items

Inserts a payment record

Clears the cart

Returns a success message + total.
 */
const db = require('../database');

const Order = {
  // Place an order (from user's cart)
  placeOrder: async ({ user_id, payment_method }) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Get cart items
        const cartItems = await new Promise((res, rej) => {
          const sql = `
            SELECT c.product_id, c.quantity, p.price
            FROM cart c
            JOIN products p ON c.product_id = p.product_id
            WHERE c.user_id = ?
          `;
          db.all(sql, [user_id], (err, rows) => (err ? rej(err) : res(rows)));
        });

        if (cartItems.length === 0) return reject(new Error('Cart is empty'));

        // Calculate total
        const total_amount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Insert order
        const orderSql = `INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, 'pending')`;
        db.run(orderSql, [user_id, total_amount], function(err) {
          if (err) return reject(err);
          const order_id = this.lastID;

          // Insert order items
          const stmt = db.prepare(`INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)`);
          cartItems.forEach(item => stmt.run(order_id, item.product_id, item.quantity, item.price));
          stmt.finalize();

          // Optional: Insert payment
          const paymentSql = `INSERT INTO payments (order_id, amount, payment_method, status) VALUES (?, ?, ?, 'completed')`;
          db.run(paymentSql, [order_id, total_amount, payment_method]);

          // Clear user's cart
          db.run(`DELETE FROM cart WHERE user_id = ?`, [user_id]);

          resolve({ message: 'Order placed successfully', order_id, total_amount });
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  // Get all orders for a user
  getOrdersByUser: (user_id) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT o.order_id, o.order_date, o.total_amount, o.status,
               GROUP_CONCAT(p.name || ' (x' || oi.quantity || ')') AS items
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE o.user_id = ?
        GROUP BY o.order_id
      `;
      db.all(sql, [user_id], (err, rows) => (err ? reject(err) : resolve(rows)));
    });
  }
};

module.exports = Order;
