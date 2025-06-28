const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Placeholder API route
router.get('/ping', (req, res) => {
  res.json({ message: 'API is alive' });
});

router.post('/update-api-doc', (req, res) => {
  const { idx, api } = req.body;
  const filePath = path.join(__dirname, '..', 'api-docs.json');
  let apis = [];
  try {
    apis = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    apis[idx] = { ...apis[idx], ...api };
    fs.writeFileSync(filePath, JSON.stringify(apis, null, 2));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
