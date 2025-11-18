const db = require('../database');
const ImageKit = require('imagekit');
const { productCache } = require('./dataStructures');

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'your_public_key',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'your_private_key',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/your_endpoint'
});

const Product = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      // Check cache first
      const cacheKey = 'all_products';
      const cached = productCache.get(cacheKey);
      if (cached) {
        console.log('Returning products from cache');
        return resolve(cached);
      }

      db.all(`SELECT * FROM products WHERE status = 'active'`, [], (err, rows) => {
        if (err) return reject(err);
        
        // Cache the results
        productCache.set(cacheKey, rows);
        console.log('Products cached');
        
        resolve(rows);
      });
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      // Check cache first
      const cacheKey = `product_${id}`;
      const cached = productCache.get(cacheKey);
      if (cached) {
        console.log('Returning product from cache');
        return resolve(cached);
      }

      db.get(`SELECT * FROM products WHERE product_id = ?`, [id], (err, row) => {
        if (err) return reject(err);
        
        if (row) {
          productCache.set(cacheKey, row);
        }
        
        resolve(row);
      });
    });
  },

  create: async ({ name, description = null, category_id = null, price, stock_quantity = 0, image_url = null, status = 'active' }) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO products (name, description, category_id, price, stock_quantity, image_url, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(sql, [name, description, category_id, price, stock_quantity, image_url, status], function(err) {
        if (err) return reject(err);
        
        // Clear product cache since data changed
        productCache.delete('all_products');
        
        resolve({ 
          product_id: this.lastID, 
          name, 
          description, 
          category_id, 
          price, 
          stock_quantity, 
          image_url, 
          status 
        });
      });
    });
  },

  update: (id, { name, description, category_id, price, stock_quantity, image_url, status }) => {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE products
        SET name=?, description=?, category_id=?, price=?, stock_quantity=?, image_url=?, status=?
        WHERE product_id=?
      `;
      
      db.run(sql, [name, description, category_id, price, stock_quantity, image_url, status, id], function(err) {
        if (err) return reject(err);
        
        // Clear relevant caches
        productCache.delete('all_products');
        productCache.delete(`product_${id}`);
        
        resolve({ 
          product_id: id, 
          name, 
          description, 
          category_id, 
          price, 
          stock_quantity, 
          image_url, 
          status 
        });
      });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run(`UPDATE products SET status = 'inactive' WHERE product_id = ?`, [id], function(err) {
        if (err) return reject(err);
        
        // Clear caches
        productCache.delete('all_products');
        productCache.delete(`product_${id}`);
        
        resolve({ deleted: this.changes });
      });
    });
  },

  // ImageKit upload method
  uploadImage: (file, fileName) => {
    return new Promise((resolve, reject) => {
      imagekit.upload({
        file: file,
        fileName: fileName || `product_${Date.now()}`,
        folder: "/products"
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  }

};

module.exports = Product;