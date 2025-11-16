const db = require('../database');

const Payment = {
  createPayment: ({ order_id, amount, payment_method, status='pending' }) => {
    return new Promise((resolve, reject) => {
      db.run(`INSERT INTO payments (order_id, amount, payment_method, status) VALUES (?, ?, ?, ?)`,
        [order_id, amount, payment_method, status], function(err) {
          if (err) return reject(err);
          resolve(this.lastID);
        });
    });
  },

  updatePaymentOrder: (payment_id, order_id, status='completed') => {
    return new Promise((resolve, reject) => {
      db.run(`UPDATE payments SET order_id=?, status=? WHERE payment_id=?`, [order_id, status, payment_id], function(err) {
        if (err) return reject(err);
        resolve({ updated: this.changes });
      });
    });
  },

  getPaymentByOrder: (order_id) => {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM payments WHERE order_id=?`, [order_id], (err, row) => (err ? reject(err) : resolve(row)));
    });
  }
};

module.exports = Payment;
