const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./ecommerce.db');

// Create tables if they don't exist
db.serialize(() => {
  // Users
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      role TEXT DEFAULT 'customer',
      date_created DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Categories
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      category_id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_name TEXT NOT NULL,
      description TEXT
    )
  `);

  // Products
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      product_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category_id INTEGER,
      price REAL NOT NULL,
      stock_quantity INTEGER DEFAULT 0,
      image_url TEXT,
      status TEXT DEFAULT 'active',
      date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(category_id) REFERENCES categories(category_id)
    )
  `);

  // Cart
  db.run(`
    CREATE TABLE IF NOT EXISTS cart (
      cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      product_id INTEGER,
      quantity INTEGER DEFAULT 1,
      date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(user_id),
      FOREIGN KEY(product_id) REFERENCES products(product_id)
    )
  `);

  // Orders
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_amount REAL,
      payment_id INTEGER,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY(user_id) REFERENCES users(user_id)
    )
  `);

  // Order items
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      price_at_purchase REAL,
      FOREIGN KEY(order_id) REFERENCES orders(order_id),
      FOREIGN KEY(product_id) REFERENCES products(product_id)
    )
  `);

  // Payments
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      amount REAL NOT NULL,
      payment_method TEXT,
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT CHECK(status IN ('pending','completed','failed')) DEFAULT 'pending',
      FOREIGN KEY(order_id) REFERENCES orders(order_id)
    )
  `);
});

module.exports = db;
