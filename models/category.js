// models/category.js
const db = require('../database');

const Category = {
  create: ({ category_name, description }) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO categories (category_name, description) VALUES (?, ?)`;
      db.run(sql, [category_name, description], function(err) {
        if (err) return reject(err);
        resolve({ category_id: this.lastID, category_name, description });
      });
    });
  },

  getAll: () => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM categories`, [], (err, rows) => (err ? reject(err) : resolve(rows)));
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM categories WHERE category_id = ?`, [id], (err, row) => (err ? reject(err) : resolve(row)));
    });
  },

  update: (id, { category_name, description }) => {
    return new Promise((resolve, reject) => {
      db.run(`UPDATE categories SET category_name = ?, description = ? WHERE category_id = ?`, [category_name, description, id], function(err) {
        if (err) return reject(err);
        resolve({ category_id: id, category_name, description });
      });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM categories WHERE category_id = ?`, [id], function(err) {
        if (err) return reject(err);
        resolve({ message: 'Category deleted' });
      });
    });
  }
};

module.exports = Category;
