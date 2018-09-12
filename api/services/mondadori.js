const requestPromise = require('request-promise');
const cheerio = require ('cheerio');

const baseUrl = `https://www.mondadoristore.it/search/?g=`;
const affiliateURL = `http://clkuk.tradedoubler.com/click?p(10388)a(3047763)g(19782026)url`;


module.exports = function(isbn) {
  const endpointUrl = `${baseUrl}${isbn}`;
  const options = {
    uri: endpointUrl,
    resolveWithFullResponse: true
  };

  return requestPromise(options)
    .then(function (fullResponse) {
      const $ = cheerio.load(fullResponse.body);
      const $wrapper = $('.wrapper');
      const title = $wrapper.find('.title').text();
      const imgUrl = $wrapper.find('.is-book').attr('src');
      const author = $wrapper.find('.nti-author').text();
      const publisher = $wrapper.find('.nti-editor').text();
      const priceEuros = $wrapper.find('.new-price strong').html();
      const priceDecimals = $wrapper.find('.new-price strong .decimals').html();
      const availability = $wrapper.find('.lightGreen strong').html() ? true : false;
      const priceHTML = `${priceEuros.split(`<`)[0]}${priceDecimals.split(`<`)[0]}`;
      const price = parseFloat(priceHTML.replace(',', '.'))
      const link = fullResponse.request.uri.href;

      if (price !== null && priceDecimals !== null) {
        return {
          author: author,
          imgURL: `https://www.mondadoristore.it/${imgUrl}`,
          publisher: publisher,
          title: title,
          mondadori: {
            price: price,
            availability: availability,
            link: `${affiliateURL}(${link.split(`?`)[0]})`,
            storeName: `mondadori`
          }
        }
      } else {
        return {
          price: 0,
          availability: false,
          link: null,
          storeName: `mondadori`
        };
      }
    })
    .catch(function (err) {
      return {
        price: 0,
        availability: false,
        link: null,
        storeName: `mondadori`
      };
    });
};