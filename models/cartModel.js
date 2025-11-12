// models/cartModel.js
const db = require('../database');

const Cart = {
  // Get all items in a user's cart
  getCartItems: (user_id) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT c.cart_id, c.product_id, c.quantity, p.name, p.price
        FROM cart c
        JOIN products p ON c.product_id = p.product_id
        WHERE c.user_id = ?
      `;
      db.all(sql, [user_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Add a product to the cart (if exists, increment quantity)
  addToCart: (user_id, product_id, quantity = 1) => {
    return new Promise((resolve, reject) => {
      // Check if item exists
      const checkSql = `SELECT * FROM cart WHERE user_id = ? AND product_id = ?`;
      db.get(checkSql, [user_id, product_id], (err, row) => {
        if (err) return reject(err);

        if (row) {
          // Update quantity
          const updateSql = `UPDATE cart SET quantity = quantity + ? WHERE cart_id = ?`;
          db.run(updateSql, [quantity, row.cart_id], function(err) {
            if (err) reject(err);
            else resolve(row.cart_id);
          });
        } else {
          // Insert new cart item
          const insertSql = `INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)`;
          db.run(insertSql, [user_id, product_id, quantity], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          });
        }
      });
    });
  },

  // Update quantity of a cart item
  updateCartItem: (cart_id, quantity) => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE cart SET quantity = ? WHERE cart_id = ?`;
      db.run(sql, [quantity, cart_id], function(err) {
        if (err) reject(err);
        else resolve(true);
      });
    });
  },

  // Remove an item from the cart
  removeCartItem: (cart_id) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM cart WHERE cart_id = ?`;
      db.run(sql, [cart_id], function(err) {
        if (err) reject(err);
        else resolve(true);
      });
    });
  },

  // Clear all items for a user (after successful order/payment)
  clearCart: (user_id) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM cart WHERE user_id = ?`;
      db.run(sql, [user_id], function(err) {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }
};

module.exports = Cart;
