const express = require('express');

const router = express.Router();

// GET users listing
router.get('/', (req, res, _) => {
  res.send('respond with a resource ^^');
});

module.exports = router;
