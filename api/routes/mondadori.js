const express = require('express');
const request = require('request');
const cheerio = require ('cheerio');
const router = express.Router();

router.get('/:isbn', (req, res, next) => {
  const baseUrl = `https://www.mondadoristore.it/search/?g=`
  const endpointUrl = `${baseUrl}${req.params.isbn}`

  request(endpointUrl, (error, response, body) => {
    if (!error && response && response.statusCode == 200) {
      const $ = cheerio.load(body);
      const $wrapper = $('.product-data');
      const price = $wrapper.find('.new-price strong').html().split(`<`)[0];
      const priceDecimals = $wrapper.find('.new-price strong .decimals').html().split(`<`)[0];
      const availability = $wrapper.find('.lightGreen strong').html() ? true : false;
      const link = response.request.uri.href;

      const bookData = {
        price: `${price}${priceDecimals}`,
        availability: availability,
        link: link
      }

      res.status(200).json(bookData);
    } else {
      res.status(200).json({});
    }
  })
});

module.exports = router;