const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const { hashPassword, comparePassword, generateToken, verifyToken, authorizeRoles } = require('../utils/auth');

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'name, email, password required' });

  try {
    const existing = await User.findByEmail(email);
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = hashPassword(password);
    const user = await User.create({ name, email, password_hash: hashed, phone, address, role:'customer' });
    res.json({ message: 'Registered', user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });

  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = comparePassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { id: user.user_id, name: user.name, email: user.email, role: user.role };
    const token = generateToken(payload);
    res.json({ message: 'Login success', token, user: payload });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Profile
router.get('/me', verifyToken, async (req, res) => {
  const user = await User.getById(req.user.id);
  res.json(user);
});

// Admin: list users
router.get('/', verifyToken, authorizeRoles('admin'), async (req, res) => {
  const users = await User.getAll();
  res.json(users);
});

// Admin: change role
router.put('/:id/role', verifyToken, authorizeRoles('admin'), async (req, res) => {
  const { role } = req.body;
  const result = await User.updateRole(req.params.id, role);
  res.json({ message:'Role updated', result });
});

module.exports = router;
