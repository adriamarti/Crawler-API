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
      const $wrapper = $('.contbody .boxproddetail');
      const title = $wrapper.find('.detail h1').text();
      const imgUrl = $wrapper.find('.imgitem a img').attr('src');
      const author = $wrapper.find('.author a').text();
      const publisher = $wrapper.find('.publisher a').text();
      const priceHTML = $wrapper.find('.prices .currentprice').html().split(` `)[1];
      const price = parseFloat(priceHTML.replace(',', '.'));
      const availability = $wrapper.find('.availability .availability-days .notavail').html() ? false : true;
      const link = fullResponse.request.uri.href;

      if (priceHTML !== null) {
        return {
          author: author,
          imgURL: `https://${imgUrl}`,
          publisher: publisher,
          title: title,
          libraccio: {
            price: price,
            availability: availability,
            link: `${affiliateURL}(${link})`,
            storeName: `libraccio`
          }
        };
      } else {
        return {
          libraccio: {
            price: price,
            availability: availability,
            link: `${affiliateURL}(${link})`,
            storeName: `libraccio`
          }
        };
      }
    })
    .catch(function (err) {
      return {
        libraccio: {
          price: 0,
          availability: false,
          link: null,
          storeName: `libraccio`
        }
      };
    });
};