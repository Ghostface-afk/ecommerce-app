const db = require('../database');

const Product = {
  create: ({ name, description, category_id, price, stock_quantity, image_url, status }) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO products (name, description, category_id, price, stock_quantity, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.run(sql, [name, description, category_id, price, stock_quantity, image_url, status || 'active'], function(err) {
        if (err) return reject(err);
        resolve({ product_id: this.lastID, name, description, category_id, price, stock_quantity, image_url, status });
      });
    });
  },

  getAll: () => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM products`, [], (err, rows) => (err ? reject(err) : resolve(rows)));
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM products WHERE product_id = ?`, [id], (err, row) => (err ? reject(err) : resolve(row)));
    });
  },

  update: (id, data) => {
    const { name, description, category_id, price, stock_quantity, image_url, status } = data;
    return new Promise((resolve, reject) => {
      db.run(`UPDATE products SET name=?, description=?, category_id=?, price=?, stock_quantity=?, image_url=?, status=? WHERE product_id=?`,
        [name, description, category_id, price, stock_quantity, image_url, status, id], function(err) {
          if (err) return reject(err);
          resolve({ updated: this.changes });
        });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM products WHERE product_id=?`, [id], function(err) {
        if (err) return reject(err);
        resolve({ deleted: this.changes });
      });
    });
  }
};

module.exports = Product;
