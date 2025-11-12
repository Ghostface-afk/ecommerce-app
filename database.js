const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./ecommerce.db', (err) => {
  if (err) console.error('Error opening database:', err.message);
  else console.log('✅ Connected to SQLite database.');
});

// Create tables if they don’t exist
db.serialize(() => {
  // 🧍 Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'customer')) DEFAULT 'customer'
    )
  `);

  // 🏷️ Categories table
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      category_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);

  // 📦 Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      product_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      category_id INTEGER,
      FOREIGN KEY (category_id) REFERENCES categories(category_id)
    )
  `);

  // 🛒 Cart table
  db.run(`
    CREATE TABLE IF NOT EXISTS cart (
      cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (product_id) REFERENCES products(product_id)
    )
  `);

  // 🧾 Orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      payment_id INTEGER,
      total REAL NOT NULL,
      status TEXT CHECK(status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
      order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (payment_id) REFERENCES payments(payment_id)
    )
  `);

  // 📄 Order Items table
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(order_id),
      FOREIGN KEY (product_id) REFERENCES products(product_id)
    )
  `);

  // 💳 Payments table (your new addition)
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      amount REAL NOT NULL,
      payment_method TEXT,
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT CHECK(status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
      FOREIGN KEY (order_id) REFERENCES orders(order_id)
    )
  `);
});

module.exports = db;
