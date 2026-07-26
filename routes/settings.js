const express = require('express');
const path = require('path');
const { verifyToken } = require('../middleware/auth');
const { readJson, writeJson } = require('../utils/jsonStore');

const router = express.Router();
const settingsPath = path.join(__dirname, '../data/settings.json');

const DEFAULT_SETTINGS = {
  heroImage: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1600&h=900&fit=crop',
  heroTitle: 'Khám phá Mộc Châu trên những chiếc Triumph',
  heroSubtitle: 'Thuê xe máy chất lượng cao, trải nghiệm cung đường đẹp nhất tại Mộc Châu. Đặt xe ngay hôm nay!',
  logo: '',
  favicon: '',
  siteName: 'Phan Hoa Motorbike Rental Mộc Châu',
  tagline: 'CHO THUÊ XE MÁY',
  phone: '0931.6868.97',
  facebookUrl: 'https://www.facebook.com/phanhoamc',
  zaloPhone: '0931686897',
};

function getSettings() {
  return readJson(settingsPath, DEFAULT_SETTINGS);
}
function saveSettings(data) {
  writeJson(settingsPath, data);
}

// GET /api/settings - public
router.get('/', (req, res) => {
  res.json(getSettings());
});

// PUT /api/settings - protected
const EDITABLE_FIELDS = [
  'heroImage', 'heroTitle', 'heroSubtitle',
  'logo', 'favicon', 'siteName', 'tagline',
  'phone', 'facebookUrl', 'zaloPhone',
];

router.put('/', verifyToken, (req, res) => {
  const current = getSettings();
  const updated = { ...current };
  for (const field of EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) updated[field] = req.body[field];
  }
  saveSettings(updated);
  res.json(updated);
});

module.exports = router;
