const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SECRET_KEY = 'my_super_secret_key';
const EXPIRES_IN = '1h';

module.exports = {
  hashPassword: (password) => bcrypt.hashSync(password, 10),
  comparePassword: (password, hash) => bcrypt.compareSync(password, hash),
  generateToken: (payload) => jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN }),

  verifyToken: (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Invalid or expired token' });
      req.user = decoded;
      next();
    });
  },

  authorizeRoles: (...roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Access denied' });
    next();
  }
};
