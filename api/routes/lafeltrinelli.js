const express = require('express');
const request = require('request');
const cheerio = require ('cheerio');
const router = express.Router();
const errors = require('../../errors/errors');

router.get('/:isbn', (req, res, next) => {
  const baseUrl = `https://www.lafeltrinelli.it/fcom/it/home/pages/catalogo/searchresults.html?prkw=`;
  const endpointUrl = `${baseUrl}${req.params.isbn}&cat1=&prm=`;

  request(endpointUrl, (error, response, body) => {
    if (!error && response && response.statusCode == 200) {
      const $ = cheerio.load(body);
      const $wrapper = $('.product-result .gtmContext');
      const priceHTML = $wrapper.find('.gtmActualPrice').html();
      const availability = priceHTML ? true : false;
      const link = $wrapper.find('.cover a').attr('href');
      if (priceHTML !== null) {
        res.status(200).json({
          price: priceHTML.split(` `)[1],
          availability: availability,
          link: link
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