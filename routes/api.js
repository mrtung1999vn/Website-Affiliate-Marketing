const express = require('express');
const router = express.Router();

// Placeholder API route
router.get('/ping', (req, res) => {
  res.json({ message: 'API is alive' });
});

module.exports = router;
