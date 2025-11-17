const db = require('../database'); // use your SQLite db
const ImageKit = require('imagekit');

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'YOUR_PUBLIC_KEY',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'YOUR_PRIVATE_KEY',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/YOUR_ID/'
});

const Product = {

  getAll: () => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM products`, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM products WHERE id = ?`, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  create: async ({ name, description = null, category_id = null, price, stock_quantity = 0, image_file = null, status = 'active' }) => {
    return new Promise((resolve, reject) => {
      const insertProduct = (image_url) => {
        const sql = `
          INSERT INTO products (name, description, category_id, price, stock_quantity, image_url, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.run(sql, [name, description, category_id, price, stock_quantity, image_url, status], function(err) {
          if (err) return reject(err);
          resolve({ id: this.lastID, name, description, category_id, price, stock_quantity, image_url, status });
        });
      };

      if (image_file) {
        imagekit.upload({ file: image_file, fileName: name, folder: "/products" }, (err, result) => {
          if (err) return reject(err);
          insertProduct(result.url);
        });
      } else {
        insertProduct(null);
      }
    });
  },

  update: (id, { name, description, category_id, price, stock_quantity, image_file, status }) => {
    return new Promise((resolve, reject) => {
      const updateDB = (image_url) => {
        const sql = `
          UPDATE products
          SET name=?, description=?, category_id=?, price=?, stock_quantity=?, image_url=?, status=?
          WHERE id=?
        `;
        db.run(sql, [name, description, category_id, price, stock_quantity, image_url, status, id], function(err) {
          if (err) return reject(err);
          resolve({ id, name, description, category_id, price, stock_quantity, image_url, status });
        });
      };

      if (image_file) {
        imagekit.upload({ file: image_file, fileName: name, folder: "/products" }, (err, result) => {
          if (err) return reject(err);
          updateDB(result.url);
        });
      } else {
        db.get(`SELECT image_url FROM products WHERE id = ?`, [id], (err, row) => {
          if (err) return reject(err);
          updateDB(row ? row.image_url : null);
        });
      }
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM products WHERE id = ?`, [id], function(err) {
        if (err) return reject(err);
        resolve({ deleted: this.changes });
      });
    });
  }

};

module.exports = Product;
