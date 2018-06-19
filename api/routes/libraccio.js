const express = require('express');
const request = require('request');
const cheerio = require ('cheerio');
const router = express.Router();
const errors = require('../../errors/errors')

router.get('/:isbn', (req, res, next) => {
  const baseUrl = `https://www.libraccio.it/libro/`
  const endpointUrl = `${baseUrl}${req.params.isbn}/`

  request(endpointUrl, (error, response, body) => {
    if (!error && response && response.statusCode == 200) {
      const $ = cheerio.load(body);
      const $wrapper = $('.contbody .boxproddetail .primg .detail table tbody');
      const priceHTML = $wrapper.find('.prices .currentprice').html();
      const availability = $wrapper.find('.availability .availability-days .notavail').html() ? false : true;
      if (priceHTML !== null) {
        res.status(200).json({
          price: priceHTML.split(` `)[1],
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