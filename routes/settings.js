const express = require('express');
const fs = require('fs');
const path = require('path');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const settingsPath = path.join(__dirname, '../data/settings.json');

function getSettings() {
  return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
}
function saveSettings(data) {
  fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2));
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
