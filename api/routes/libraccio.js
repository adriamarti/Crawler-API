const express = require('express');
const request = require('request');
const cheerio = require ('cheerio');
const router = express.Router();

router.get('/:isbn', (req, res, next) => {
  const baseUrl = `https://www.libraccio.it/libro/`
  const endpointUrl = `${baseUrl}${req.params.isbn}/`

  request(endpointUrl, (error, response, body) => {
    if (!error && response && response.statusCode == 200) {
      const $ = cheerio.load(body);
      const $wrapper = $('.contbody .boxproddetail .primg .detail table tbody');
      const priceHTML = $wrapper.find('.prices .currentprice').html();
      const availabilityHTML = $wrapper.find('.availability .availability-days .notavail').html();
      const bookData = {
        price: priceHTML.split(` `)[1],
        availability: availabilityHTML === null ? true : false,
        link: endpointUrl
      }

      res.status(200).json(bookData);
    } else {
      res.status(200).json({});
    }
  })
});

module.exports = router;