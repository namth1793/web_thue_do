const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const usersPath = path.join(__dirname, '../data/users.json');

function getUsers() {
  return JSON.parse(fs.readFileSync(usersPath, 'utf8'));
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
  }

  const users = getUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

// POST /api/auth/verify
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(403).json({ valid: false });
  }
});

module.exports = router;
