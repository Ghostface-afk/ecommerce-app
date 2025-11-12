// utils/auth.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'my_super_secret_key';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

module.exports = {
  // Hash a plain password
  hashPassword: (password) => bcrypt.hashSync(password, 10),

  // Compare plain password to hash
  comparePassword: (password, hash) => bcrypt.compareSync(password, hash),

  // Create JWT token from user payload
  generateToken: (userPayload) => {
    // userPayload should be small: { id, name, email, role }
    return jwt.sign(userPayload, SECRET_KEY, { expiresIn: EXPIRES_IN });
  },

  // Middleware: verify token and attach user to req.user
  verifyToken: (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid authorization format. Expected: Bearer <token>' });
    }

    const token = parts[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Invalid or expired token' });
      // decoded contains payload we signed earlier
      req.user = decoded; // e.g. { id, name, email, role, iat, exp }
      next();
    });
  },

  // Middleware factory: allow only specified roles
  authorizeRoles: (...roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient privileges' });
    }
    next();
  }
};
