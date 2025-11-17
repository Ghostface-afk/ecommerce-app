```markdown
# E-Commerce Backend Overview

This project is a Node.js + SQLite backend for an e-commerce platform, implementing user management, product/catalog management, cart, orders, payments, and role-based access. It’s designed for learning and demonstration purposes.

---

## Table of Contents

- [File Structure](#file-structure)
- [Key Files & Their Roles](#key-files--their-roles)
- [Packages Used](#packages-used)
- [Setup & Running](#setup--running)
- [API Testing](#api-testing)
- [Notes](#notes)

---

## File Structure



## ecommerce-backend

├── database.js                # SQLite DB connection + table creation
├── ecommerce.db               # SQLite database file
├── server.js                  # Entry point: mounts routes, starts server
├── package.json               # Node.js project info & dependencies
├── package-lock.json          # Dependency lock file
├── node_modules/              # Installed Node modules
├── utils/                     # Utility functions
│   └── auth.js                # JWT authentication & role-based access
├── models/                    # Database interaction logic
│   ├── userModel.js           # User CRUD operations
│   ├── productModel.js        # Product CRUD operations
│   ├── categoryModel.js       # Category CRUD operations
│   ├── cartModel.js           # Cart management (add, remove, update)
│   ├── orderModel.js          # Orders and order items
│   └── paymentModel.js        # Payments logic
└── routes/                    # Express API routes
├── users.js               # User registration, login, profile, admin actions
├── products.js            # Product CRUD endpoints
├── categories.js          # Category management
├── cartRoutes.js          # Cart endpoints
├── orderRoutes.js         # Orders endpoints (place order, view orders)
└── adminRoutes.js         # Admin management: products, categories, inventory

````

---

## Key Files & Their Roles

### `server.js`
- Main entry point of the backend.
- Configures Express server.
- Mounts all routes (`/users`, `/products`, `/cart`, `/orders`, `/admin`).
- Starts the server on a specified port.

### `database.js`
- Connects to SQLite database (`ecommerce.db`).
- Creates necessary tables if they don’t exist:
  - Users, Products, Categories, Cart, Orders, Order_Items, Payments, Shipping, Reviews, Wishlist, Coupons, Inventory_Logs.

### `utils/auth.js`
- Handles authentication and authorization.
- Functions:
  - `hashPassword` → bcrypt hashing.
  - `comparePassword` → compare plaintext to hashed password.
  - `generateToken` → create JWT token.
  - `verifyToken` → middleware to validate JWT.
  - `authorizeRoles` → middleware to enforce role-based access.

### `models/`
- Contains database logic for each feature.
- Examples:
  - `userModel.js` → create user, get by email/id, update role.
  - `productModel.js` → create/update/delete product, get all or by ID.
  - `cartModel.js` → add, update, remove items, clear cart.
  - `orderModel.js` → create orders, add items, get orders by user/admin.
  - `paymentModel.js` → create/update payment records.

### `routes/`
- Maps HTTP requests to model actions.
- Examples:
  - `users.js` → `/register`, `/login`, `/me`, `/` (admin view), `/id/role` (change role)
  - `products.js` → public GET endpoints + admin POST/PUT/DELETE
  - `cartRoutes.js` → `/add`, `/update`, `/remove/:id`, `/clear`
  - `orderRoutes.js` → `/place`, `/my`, `/:orderId` (user/admin views)
  - `adminRoutes.js` → manage products, categories, inventory, view all orders

---

## Packages Used

| Package       | Purpose |
|---------------|---------|
| `express`     | Web framework for API routes |
| `cors`        | Cross-Origin Resource Sharing |
| `body-parser` | Parse JSON request bodies (optional if using Express 4.16+) |
| `sqlite3`     | SQLite database |
| `bcryptjs`    | Password hashing |
| `jsonwebtoken`| JWT creation and verification |
| `dotenv`      | Environment variable management |

---

## Setup & Running

1. **Clone repository**:
   ```bash
   git clone <repo_url>
   cd ecommerce-app
````

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the server**:

   ```bash
   node server.js
   ```

   * Server runs on `http://localhost:5000` (default).
   * Ensure database (`ecommerce.db`) is created automatically.

---

## API Testing

* Use **Postman** or **cURL** to test endpoints.
* Example: Register a user

  ```bash
  curl -X POST http://localhost:5000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lawrence",
    "email": "lawrence@example.com",
    "password": "mypassword",
    "phone": "0712345678",
    "address": "Nairobi, Kenya"
  }'
  ```
* You can also test login, add products, add to cart, place orders, etc.

---

## Notes

* No frontend included; backend can be tested via Postman or curl.
* Role-based access enforced:

  * `admin` → full management
  * `customer` → limited access (cart, place orders)
* Environment variables optional for now (`.env` not required if local testing).
* SQLite used for simplicity; can switch to MySQL/PostgreSQL if scaling.

Perfect! If you want the admin to upload images using **Firebase Storage** (Option 1), here’s a full guide you can include in your project README or follow for your admin workflow.

---

# 📝 Admin Image Upload Instructions using Firebase Storage

## 1️⃣ Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Go to **Storage** → **Get started** → select your location → click **Done**.
3. Go to **Project Settings** → **Service Accounts** → **Generate new private key**.
   This will download a JSON file (e.g., `firebaseAdminKey.json`) — keep it secure.

---

## 2️⃣ Add Firebase Admin SDK to your backend

Install the Firebase Admin package:

```bash
npm install firebase-admin
```

Create a `firebaseAdmin.js` file in your backend root:

```js
// firebaseAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('./firebaseAdminKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'YOUR_PROJECT_ID.appspot.com' // replace with your Firebase project ID
});

const bucket = admin.storage().bucket();

module.exports = bucket;
```

---

## 3️⃣ Upload images manually to Firebase

1. Go to **Storage** → **Files** → **Upload files**
2. Select the image you want (e.g., `laptop1.png`)
3. After upload, click the file → **File URL** → copy it.

---

## 4️⃣ Add image URL to product

When creating a product via your backend (POST `/products`), paste the **Firebase Storage file URL** in the `image_url` field:

```json
{
  "name": "Laptop XYZ",
  "description": "High-performance laptop",
  "price": 1200,
  "category_id": 2,
  "stock_quantity": 10,
  "image_url": "https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT_ID.appspot.com/o/laptop1.png?alt=media"
}
```

The backend will store the URL in the database — no file handling needed.

---

## 5️⃣ Optional: Make Firebase Storage Public (if needed)

By default, Firebase Storage is **restricted**.
To make images accessible to everyone:

1. Go to **Storage → Rules**
2. Change the rules temporarily for public read:

```txt
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;  // anyone can read
      allow write: if request.auth != null;  // only authenticated users can write
    }
  }
}
```

⚠️ Only use public read for testing/demo purposes.
For production, restrict access and generate **signed URLs**.

---

## 6️⃣ Workflow Summary for Admin

1. Upload image to Firebase Storage.
2. Copy the URL provided by Firebase.
3. Paste the URL in the product creation form.
4. Backend stores the URL — frontend can use it to display images.

---
✅ This approach keeps your backend simple and avoids file storage management.
---