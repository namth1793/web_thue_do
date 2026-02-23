require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();

// CORS: cho phép localhost (dev) + Vercel domain (production)
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';
app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^https:\/\/.*\.vercel\.app$/.test(origin) ||
      (ALLOWED_ORIGIN && origin === ALLOWED_ORIGIN)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Tự động hash mật khẩu plaintext khi khởi động
const usersPath = path.join(__dirname, 'data/users.json');
(function initUsers() {
  let users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  let changed = false;
  users = users.map(user => {
    if (!user.password.startsWith('$2')) {
      user.password = bcrypt.hashSync(user.password, 10);
      changed = true;
    }
    return user;
  });
  if (changed) {
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    console.log('✅ Đã hash mật khẩu admin');
  }
})();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/revenue', require('./routes/revenue'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Thuê Đồ API đang chạy' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
