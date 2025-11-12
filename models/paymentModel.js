const db = require('../database');

exports.createPayment = ({ order_id, amount, payment_method, status = 'pending' }) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO payments (order_id, amount, payment_method, status)
      VALUES (?, ?, ?, ?)
    `;
    db.run(sql, [order_id, amount, payment_method, status], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

exports.updatePaymentOrder = (payment_id, order_id, status = 'completed') => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE payments
      SET order_id = ?, status = ?
      WHERE payment_id = ?
    `;
    db.run(sql, [order_id, status, payment_id], function (err) {
      if (err) reject(err);
      else resolve(true);
    });
  });
};

exports.getPaymentByOrder = (order_id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM payments WHERE order_id = ?`;
    db.get(sql, [order_id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};
const db = require('../database');

const Product = {
  // Create new product
  createProduct: ({ name, description, category_id, price, stock_quantity, image_url, status = 'active' }) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO products
          (name, description, category_id, price, stock_quantity, image_url, status, date_added)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `;
      db.run(sql, [name, description, category_id, price, stock_quantity, image_url, status], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  // Update existing product
  updateProduct: (product_id, fields) => {
    return new Promise((resolve, reject) => {
      const allowedFields = ['name','description','category_id','price','stock_quantity','image_url','status'];
      const updates = [];
      const values = [];
      for (const key of allowedFields) {
        if (fields[key] !== undefined) {
          updates.push(`${key} = ?`);
          values.push(fields[key]);
        }
      }
      if (updates.length === 0) return resolve(false); // nothing to update

      const sql = `UPDATE products SET ${updates.join(', ')} WHERE product_id = ?`;
      values.push(product_id);
      db.run(sql, values, function(err) {
        if (err) reject(err);
        else resolve(true);
      });
    });
  },

  // Delete product
  deleteProduct: (product_id) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM products WHERE product_id = ?`;
      db.run(sql, [product_id], function(err) {
        if (err) reject(err);
        else resolve(true);
      });
    });
  },

  // Update stock quantity
  updateStock: (product_id, stock_quantity) => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE products SET stock_quantity = ? WHERE product_id = ?`;
      db.run(sql, [stock_quantity, product_id], function(err) {
        if (err) reject(err);
        else resolve(true);
      });
    });
  },

  // Get all products (optional, for admin)
  getAllProducts: () => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM products ORDER BY date_added DESC`;
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Get single product by ID
  getProductById: (product_id) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM products WHERE product_id = ?`;
      db.get(sql, [product_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

module.exports = Product;
