const express = require('express');
const router = express.Router();
const lafeltrinelliService = require('../services/lafeltrinelli');

router.get('/:isbn', (req, res, next) => {
  lafeltrinelliService(req.params.isbn).then((response) => {
    res.json(response);
  });
});

module.exports = router;