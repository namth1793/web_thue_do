const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { readJson } = require('../utils/jsonStore');

const router = express.Router();
const usersPath = path.join(__dirname, '../data/users.json');

// Same seed admin account committed in data/users.json — used to self-heal
// if the data file is ever missing (e.g. an empty persistent volume).
const DEFAULT_USERS = [
  {
    id: '1',
    email: 'admin@thuedo.vn',
    password: '$2a$10$hn/T8CbIqZ44VE227eQdbO36v.nA8TwtueZE9o3wNWEQTwhxLaSae',
    name: 'Admin Thuê Đồ',
    role: 'admin',
  },
];

function getUsers() {
  return readJson(usersPath, DEFAULT_USERS);
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET chưa được cấu hình trên server');
      return res.status(500).json({ message: 'Lỗi cấu hình server' });
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
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Lỗi đăng nhập' });
  }
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
