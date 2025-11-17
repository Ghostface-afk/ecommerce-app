Perfect! Here’s a complete `README.md` for your **E-commerce Backend**, combining project overview, folder structure, packages, features, and the admin Firebase image upload instructions:

```markdown
# 🛒 E-commerce Backend

This backend is a modular Node.js + Express + SQLite system with authentication, role-based access, product management, cart, orders, payments, and admin functionalities.

---

## 1️⃣ Project Overview

This backend allows:

- **User management:** Register, login, view profile, update role (admin only).  
- **Product management:** CRUD products, associate categories, manage stock.  
- **Category management:** CRUD categories (admin only).  
- **Cart system:** Add, update, remove items, clear cart.  
- **Orders:** Place orders, view user orders, view detailed order with items & payment.  
- **Payments:** Simulated payment logic with SQLite storage.  
- **Admin:** View all orders, manage products & categories, manage inventory.  
- **Firebase Integration:** Admin can upload images to Firebase Storage and use URLs in products.

---

## 2️⃣ Folder Structure

```

ecommerce-backend/
├── database.js                # SQLite DB connection & table creation
├── ecommerce.db               # SQLite database file
├── server.js                  # Entry point: mounts routes, starts server
├── package.json               # Node.js project info & dependencies
├── package-lock.json          # Dependency lock file
├── node_modules/              # Installed Node modules

├── utils/                     # Utility functions
│   └── auth.js                # JWT authentication & role-based access

├── models/                    # Database interaction logic
│   ├── userModel.js           # Users: CRUD, getByEmail, getById, updateRole
│   ├── productModel.js        # Products: CRUD, getAll, getById
│   ├── categoryModel.js       # Categories: CRUD, getAll, getById
│   ├── cartModel.js           # Cart: add, update, remove, clear, get items
│   ├── orderModel.js          # Orders: create, add items, get by user, get details
│   └── paymentModel.js        # Payments: create, update, get by order

└── routes/                    # Express routes (API endpoints)
├── users.js               # User registration, login, profile, admin role
├── products.js            # Product CRUD routes
├── categories.js          # Category CRUD routes
├── cartRoutes.js          # Cart endpoints
├── orderRoutes.js         # Order endpoints
└── adminRoutes.js         # Admin endpoints: orders, products, categories

````

---

## 3️⃣ Key Packages

- **express:** Web framework  
- **sqlite3:** Database driver  
- **bcryptjs:** Password hashing  
- **jsonwebtoken:** JWT for authentication  
- **cors:** Cross-origin resource sharing  
- **firebase-admin:** Firebase Storage integration (for admin image uploads)

---

## 4️⃣ Features & Endpoints

### Users

| Endpoint                | Method | Role        | Description                     |
|-------------------------|--------|------------|---------------------------------|
| `/users/register`       | POST   | Public     | Register new user               |
| `/users/login`          | POST   | Public     | Login and receive JWT           |
| `/users/me`             | GET    | Auth       | View current user profile       |
| `/users`                | GET    | Admin      | View all users                  |
| `/users/:id/role`       | PUT    | Admin      | Update user role                |

### Products

| Endpoint            | Method | Role        | Description             |
|--------------------|--------|------------|-------------------------|
| `/products`        | GET    | Public     | Get all products        |
| `/products/:id`    | GET    | Public     | Get product by ID       |
| `/products`        | POST   | Admin      | Create new product      |
| `/products/:id`    | PUT    | Admin      | Update product          |
| `/products/:id`    | DELETE | Admin      | Delete product          |

### Cart

| Endpoint              | Method | Role | Description                   |
|-----------------------|--------|------|-------------------------------|
| `/cart`               | GET    | Auth | Get all cart items            |
| `/cart/add`           | POST   | Auth | Add product to cart           |
| `/cart/update`        | PUT    | Auth | Update quantity of cart item  |
| `/cart/remove/:cart_id` | DELETE | Auth | Remove item from cart         |
| `/cart/clear`         | DELETE | Auth | Clear entire cart             |

### Orders

| Endpoint              | Method | Role | Description                     |
|-----------------------|--------|------|---------------------------------|
| `/orders/place`       | POST   | Auth | Place new order (with payment) |
| `/orders/my`          | GET    | Auth | Get current user's orders       |
| `/orders/:orderId`    | GET    | Auth | Get order details               |
| `/orders`             | GET    | Admin | View all orders                 |

### Admin

| Endpoint             | Method | Role  | Description                       |
|---------------------|--------|-------|-----------------------------------|
| `/admin/products`    | POST/PUT/DELETE | Admin | Manage product CRUD           |
| `/admin/categories`  | POST/PUT/DELETE | Admin | Manage categories             |
| `/admin/orders`      | GET    | Admin | View all orders                   |

---

## 5️⃣ Admin Image Upload via Firebase

### Steps

1. Upload image to Firebase Storage.  
2. Copy the file URL.  
3. Add it in `image_url` field when creating/updating product.  

Example product creation JSON:

```json
{
  "name": "Laptop XYZ",
  "description": "High-performance laptop",
  "price": 1200,
  "category_id": 2,
  "stock_quantity": 10,
  "image_url": "https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT_ID.appspot.com/o/laptop1.png?alt=media"
}
````

---

## 6️⃣ Testing the Backend

* Use **Postman** or **cURL** to test endpoints.
* Make sure `server.js` is running:

```bash
node server.js
```

* Example registration request:

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

---

## 7️⃣ Notes

* No frontend is required to test the API.
* JWT token is required for authenticated routes (`/me`, `/cart`, `/orders`).
* Admin routes require `role: admin`.
* Product images should be hosted on Firebase for proper URL linking.
* Payment system is simulated; real payment gateway integration is not included.

---

## ✅ Summary

This backend is fully modular, supporting authentication, product management, cart, orders, payments, and admin operations. Firebase integration allows admins to manage product images efficiently. Testing can be done entirely with Postman or cURL.

```

---

If you want, I can also **generate a diagram image (flowchart/ER diagram)** and include it in this markdown for visual reference so the team can see models, routes, and interactions.  

Do you want me to do that next?
```
