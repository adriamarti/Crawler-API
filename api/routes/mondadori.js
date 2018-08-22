const express = require('express');
const router = express.Router();
const mondadoriService = require('../services/mondadori');

router.get('/:isbn', (req, res, next) => {
  mondadoriService(req.params.isbn).then((response) => {
    res.json(response);
  });
});

module.exports = router;