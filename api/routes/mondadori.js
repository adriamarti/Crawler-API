const express = require('express');
const request = require('request');
const cheerio = require ('cheerio');
const router = express.Router();
const errors = require('../../errors/errors');

router.get('/:isbn', (req, res, next) => {
  const baseUrl = `https://www.mondadoristore.it/search/?g=`;
  const endpointUrl = `${baseUrl}${req.params.isbn}`;

  request(endpointUrl, (error, response, body) => {
    if (!error && response && response.statusCode == 200) {
      const $ = cheerio.load(body);
      const $wrapper = $('.product-data');
      const price = $wrapper.find('.new-price strong').html();
      const priceDecimals = $wrapper.find('.new-price strong .decimals').html();
      const availability = $wrapper.find('.lightGreen strong').html() ? true : false;
      const link = response.request.uri.href;

      if (price !== null && priceDecimals !== null) {
        res.status(200).json({
          price: `${price.split(`<`)[0]}${priceDecimals.split(`<`)[0]}`,
          availability: availability,
          link: endpointUrl
        });
      } else {
        res.json(errors.productNotAvailable());
      }
    } else {
      res.json(errors.productNotAvailable());
    }
  })
});

module.exports = router;