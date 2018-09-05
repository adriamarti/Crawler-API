const requestPromise = require('request-promise');
const cheerio = require ('cheerio');

const baseUrl = `https://www.lafeltrinelli.it/fcom/it/home/pages/catalogo/searchresults.html?prkw=`;
const affiliateURL = `http://tracker.tradedoubler.com/click?p=71740&a=3047763&g=0&url=`;


module.exports = function(isbn) {
  const endpointUrl = `${baseUrl}${isbn}`;
  const options = {
    uri: endpointUrl,
    transform: function (body) {
        return cheerio.load(body);
    }
  };

  return requestPromise(options)
    .then(function ($) {
      const $wrapper = $('.product-result .gtmContext');
      const priceHTML = $wrapper.find('.gtmActualPrice').html().split(` `)[1];
      const price = parseFloat(priceHTML.replace(',', '.'))
      const availability = priceHTML ? true : false;
      const link = $wrapper.find('.cover a').attr('href');

      if (priceHTML !== null) {
        return {
          price: price,
          availability: availability,
          link: `${affiliateURL}${link}`,
          storeName: `lafeltrinelli`
        };
      } else {
        return {
          price: 0,
          availability: false,
          link: null,
          storeName: `lafeltrinelli`
        };
      }
    })
    .catch(function (err) {
      return {
        price: 0,
        availability: false,
        link: null,
        storeName: `lafeltrinelli`
      };
    });
};