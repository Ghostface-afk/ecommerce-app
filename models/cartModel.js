const db = require('../database');

const Cart = {
  addToCart: (user_id, product_id, quantity) => {
    return new Promise((resolve, reject) => {
      db.run(`INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)`, [user_id, product_id, quantity], function(err) {
        if (err) return reject(err);
        resolve(this.lastID);
      });
    });
  },

  getCartItems: (user_id) => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT c.cart_id, c.product_id, c.quantity, p.name, p.price 
              FROM cart c JOIN products p ON c.product_id = p.product_id
              WHERE c.user_id = ?`, [user_id], (err, rows) => (err ? reject(err) : resolve(rows)));
    });
  },

  updateCartItem: (cart_id, quantity) => {
    return new Promise((resolve, reject) => {
      db.run(`UPDATE cart SET quantity=? WHERE cart_id=?`, [quantity, cart_id], function(err) {
        if (err) return reject(err);
        resolve({ updated: this.changes });
      });
    });
  },

  removeCartItem: (cart_id) => {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM cart WHERE cart_id=?`, [cart_id], function(err) {
        if (err) return reject(err);
        resolve({ deleted: this.changes });
      });
    });
  },

  clearCart: (user_id) => {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM cart WHERE user_id=?`, [user_id], function(err) {
        if (err) return reject(err);
        resolve({ cleared: this.changes });
      });
    });
  }
};

module.exports = Cart;
