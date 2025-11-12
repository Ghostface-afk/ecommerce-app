const db = require('../database');

const Category = {
  // Create new category
  createCategory: ({ category_name, description }) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO categories (category_name, description)
        VALUES (?, ?)
      `;
      db.run(sql, [category_name, description], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  // Update category
  updateCategory: (category_id, fields) => {
    return new Promise((resolve, reject) => {
      const allowedFields = ['category_name','description'];
      const updates = [];
      const values = [];
      for (const key of allowedFields) {
        if (fields[key] !== undefined) {
          updates.push(`${key} = ?`);
          values.push(fields[key]);
        }
      }
      if (updates.length === 0) return resolve(false);

      const sql = `UPDATE categories SET ${updates.join(', ')} WHERE category_id = ?`;
      values.push(category_id);
      db.run(sql, values, function(err) {
        if (err) reject(err);
        else resolve(true);
      });
    });
  },

  // Delete category
  deleteCategory: (category_id) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM categories WHERE category_id = ?`;
      db.run(sql, [category_id], function(err) {
        if (err) reject(err);
        else resolve(true);
      });
    });
  },

  // Get all categories
  getAllCategories: () => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM categories ORDER BY category_name ASC`;
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Get category by ID
  getCategoryById: (category_id) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM categories WHERE category_id = ?`;
      db.get(sql, [category_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

module.exports = Category;
