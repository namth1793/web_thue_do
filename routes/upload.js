const express = require('express');
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/auth');
const { storage } = require('../utils/cloudinary');

const router = express.Router();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const isValid = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase().slice(1));
    cb(null, isValid);
  },
});

// POST /api/upload
router.post('/', verifyToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không có file hoặc định dạng không hợp lệ' });
  }
  res.json({ url: req.file.path });
});

module.exports = router;
