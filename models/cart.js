const db = require('../database');

const Cart = {
  // Add item to cart
  addItem: ({ user_id, product_id, quantity }) => {
    return new Promise((resolve, reject) => {
      // Check if product already in cart
      const checkSql = `SELECT * FROM cart WHERE user_id = ? AND product_id = ?`;
      db.get(checkSql, [user_id, product_id], (err, row) => {
        if (err) return reject(err);
        if (row) {
          // Update quantity if already exists
          const updateSql = `UPDATE cart SET quantity = quantity + ? WHERE cart_id = ?`;
          db.run(updateSql, [quantity, row.cart_id], function(err) {
            if (err) reject(err);
            else resolve({ message: 'Quantity updated in cart', cart_id: row.cart_id });
          });
        } else {
          // Insert new cart item
          const insertSql = `INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)`;
          db.run(insertSql, [user_id, product_id, quantity], function(err) {
            if (err) reject(err);
            else resolve({ message: 'Item added to cart', cart_id: this.lastID });
          });
        }
      });
    });
  },

  // Get all items in user's cart
  getCartByUser: (user_id) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT c.cart_id, c.quantity, p.product_id, p.name, p.price, p.image_url
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

  // Remove item from cart
  removeItem: (cart_id) => {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM cart WHERE cart_id = ?`, [cart_id], function(err) {
        if (err) reject(err);
        else resolve({ message: 'Item removed from cart' });
      });
    });
  },

  // Clear user's cart (used after order)
  clearCart: (user_id) => {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM cart WHERE user_id = ?`, [user_id], function(err) {
        if (err) reject(err);
        else resolve({ message: 'Cart cleared' });
      });
    });
  }
};

module.exports = Cart;
