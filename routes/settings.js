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
router.put('/', verifyToken, (req, res) => {
  const current = getSettings();
  const { heroImage, heroTitle, heroSubtitle } = req.body;
  const updated = {
    ...current,
    ...(heroImage !== undefined && { heroImage }),
    ...(heroTitle !== undefined && { heroTitle }),
    ...(heroSubtitle !== undefined && { heroSubtitle }),
  };
  saveSettings(updated);
  res.json(updated);
});

module.exports = router;
