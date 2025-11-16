const db = require('../database');

const User = {
  create: ({ name, email, password_hash, phone, address, role }) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO users (name, email, password_hash, phone, address, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.run(sql, [name, email, password_hash, phone, address, role], function(err) {
        if (err) return reject(err);
        resolve({ user_id: this.lastID, name, email, phone, address, role });
      });
    });
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE user_id = ?`, [id], (err, row) => (err ? reject(err) : resolve(row)));
    });
  },

  getAll: () => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT user_id, name, email, phone, address, role, date_created FROM users`, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  updateRole: (id, role) => {
    return new Promise((resolve, reject) => {
      db.run(`UPDATE users SET role = ? WHERE user_id = ?`, [role, id], function(err) {
        if (err) return reject(err);
        resolve({ updated: this.changes });
      });
    });
  }
};

module.exports = User;
