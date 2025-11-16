const db = require('../database');

const Category = {
  create: (name, description) => {
    return new Promise((resolve, reject) => {
      db.run(`INSERT INTO categories (category_name, description) VALUES (?, ?)`, [name, description], function(err) {
        if (err) return reject(err);
        resolve({ category_id: this.lastID, name, description });
      });
    });
  },

  getAll: () => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM categories`, [], (err, rows) => (err ? reject(err) : resolve(rows)));
    });
  },

  update: (id, name, description) => {
    return new Promise((resolve, reject) => {
      db.run(`UPDATE categories SET category_name=?, description=? WHERE category_id=?`, [name, description, id], function(err) {
        if (err) return reject(err);
        resolve({ updated: this.changes });
      });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM categories WHERE category_id=?`, [id], function(err) {
        if (err) return reject(err);
        resolve({ deleted: this.changes });
      });
    });
  }
};

module.exports = Category;
