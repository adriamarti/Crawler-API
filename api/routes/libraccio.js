const express = require('express');
const router = express.Router();
const libraccioService = require('../services/libraccio');

router.get('/:isbn', (req, res, next) => {
  libraccioService(req.params.isbn).then((response) => {
    res.json(response);
  });
});

module.exports = router;