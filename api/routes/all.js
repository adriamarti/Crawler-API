const express = require('express');
const request = require('request');
const requestPromise = require('request-promise');
const router = express.Router();
const errors = require('../../errors/errors');

function fetchBooksData(config) {
  const promises = [];

  Object.keys(config).forEach((book) => {
    const options = {
      uri: config[book],
      headers: {'User-Agent': 'Request-Promise'},
      json: true
    };

    promises.push(requestPromise(options).then(response => response));    
  });

  return Promise.all(promises);
}

router.get('/:isbn', (req, res, next) => {
  const requestUrl = `${req.protocol}://${req.headers.host}`
  const config = {
    libraccio: `${requestUrl}/libraccio/${req.params.isbn}`,
    mondadori: `${requestUrl}/mondadori/${req.params.isbn}`,
    lafeltrinelli: `${requestUrl}/lafeltrinelli/${req.params.isbn}`
  }

  fetchBooksData(config).then((response) => {
    try {
      const books = {}

      Object.keys(config).forEach((book, index) => {
        books[book] = response[index]
      })

      res.json(books)
    } catch (error) {
      res.json(errors.productNotAvailable());
    }
  })
});

module.exports = router;