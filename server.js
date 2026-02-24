require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();

// CORS: allow all origins (JWT uses Authorization header, not cookies)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Hash plaintext passwords on startup
const usersPath = path.join(__dirname, 'data/users.json');
try {
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
    console.log('Password hashed successfully');
  }
} catch (err) {
  console.error('Warning: could not initialize users:', err.message);
}

// Serve uploaded images as static files
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/revenue', require('./routes/revenue'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Thue Do API is running' });
});

const PORT = process.env.PORT || 3001;
// Bind to 0.0.0.0 explicitly — required for Railway/Docker environments
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
