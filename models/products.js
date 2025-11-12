// models/product.js
const db = require('../database');

const Product = {
  create: ({ name, description = null, category_id = null, price, stock_quantity = 0, image_url = null, status = 'active' }) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO products (name, description, category_id, price, stock_quantity, image_url, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      db.run(sql, [name, description, category_id, price, stock_quantity, image_url, status], function(err) {
        if (err) return reject(err);
        resolve({ product_id: this.lastID, name, description, category_id, price, stock_quantity, image_url, status });
      });
    });
  },

  getAll: () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT p.*, c.category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
      `;
      db.all(sql, [], (err, rows) => (err ? reject(err) : resolve(rows)));
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM products WHERE product_id = ?`, [id], (err, row) => (err ? reject(err) : resolve(row)));
    });
  },

  update: (id, { name, description, category_id, price, stock_quantity, image_url, status }) => {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE products
        SET name = ?, description = ?, category_id = ?, price = ?, stock_quantity = ?, image_url = ?, status = ?
        WHERE product_id = ?
      `;
      db.run(sql, [name, description, category_id, price, stock_quantity, image_url, status, id], function(err) {
        if (err) return reject(err);
        resolve({ product_id: id, name, description, category_id, price, stock_quantity, image_url, status });
      });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM products WHERE product_id = ?`, [id], function(err) {
        if (err) return reject(err);
        resolve({ message: 'Product deleted' });
      });
    });
  }
};

module.exports = Product;
