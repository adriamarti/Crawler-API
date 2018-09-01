const requestPromise = require('request-promise');
const cheerio = require ('cheerio');

const baseUrl = `https://www.libraccio.it/libro/`;
const affiliateURL = `http://clkuk.tradedoubler.com/click?p(238295)a(3047763)g(21294776)url`;

module.exports = function(isbn) {
  const endpointUrl = `${baseUrl}${isbn}/`;
  const options = {
    uri: endpointUrl,
    resolveWithFullResponse: true
  };

  return requestPromise(options)
    .then(function (fullResponse) {
      const $ = cheerio.load(fullResponse.body);
      const $wrapper = $('.contbody .boxproddetail .primg .detail table tbody');
      const priceHTML = $wrapper.find('.prices .currentprice').html();
      const availability = $wrapper.find('.availability .availability-days .notavail').html() ? false : true;
      const link = fullResponse.request.uri.href;

      if (priceHTML !== null) {
        return {
          price: priceHTML.split(` `)[1],
          availability: availability,
          link: `${affiliateURL}(${link})`,
          storeName: `libraccio`
        };
      } else {
        return {
          price: `0,00`,
          availability: false,
          link: null,
          storeName: `libraccio`
        };
      }
    })
    .catch(function (err) {
      return {
        price: `0,00`,
        availability: false,
        link: null,
        storeName: `libraccio`
      };
    });
};