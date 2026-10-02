const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../services/store');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const { ACCOUNTS } = require('../services/blockchain');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = store.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or credentials" });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid email or credentials" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { passwordHash, ...userProfile } = user;
  res.json({
    token,
    user: userProfile
  });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const { passwordHash, ...userProfile } = req.user;
  res.json({ user: userProfile });
});

// GET /api/auth/participants (for transfers dropdown)
router.get('/participants', (req, res) => {
  const users = store.getUsers().map(u => ({
    id: u.id,
    name: u.name,
    role: u.role,
    organization: u.organization,
    location: u.location,
    ethAddress: u.ethAddress,
    isApproved: u.isApproved,
    licenseNumber: u.licenseNumber
  }));
  res.json({ participants: users });
});

// POST /api/auth/switch-demo (switch user role for quick presentation demo)
router.post('/switch-demo', (req, res) => {
  const { role } = req.body;
  const user = store.getUsers().find(u => u.role.toLowerCase() === (role || '').toLowerCase());
  if (!user) {
    return res.status(404).json({ error: `Demo account for role '${role}' not found` });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { passwordHash, ...userProfile } = user;
  res.json({
    token,
    user: userProfile
  });
});

module.exports = router;
