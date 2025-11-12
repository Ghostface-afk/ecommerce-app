// models/user.js
const db = require('../database');

const User = {
  create: ({ name, email, password_hash, phone = null, address = null, role = 'customer' }) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO users (name, email, password_hash, phone, address, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.run(sql, [name, email, password_hash, phone, address, role], function(err) {
        if (err) return reject(err);
        resolve({ user_id: this.lastID, name, email, role });
      });
    });
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  getById: (user_id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT user_id, name, email, phone, address, role, date_created FROM users WHERE user_id = ?', [user_id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  getAll: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT user_id, name, email, role, date_created FROM users', [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  // Update role (admin-only endpoint will call this)
  updateRole: (user_id, newRole) => {
    return new Promise((resolve, reject) => {
      db.run('UPDATE users SET role = ? WHERE user_id = ?', [newRole, user_id], function(err) {
        if (err) return reject(err);
        resolve({ user_id, role: newRole });
      });
    });
  }
};

module.exports = User;
