const express = require('express');
const request = require('request');
const requestPromise = require('request-promise');
const router = express.Router();
const errors = require('../../errors/errors');
const { OperationHelper } = require('apac');

const amazonData = new OperationHelper({
  awsId:     'AKIAJAVMDR2LKXU6C4OQ',
  awsSecret: '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',
  assocId:   'lettura-21',
  locale:    'IT'
});

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
  const isbn = req.params.isbn
  const amazonConfig = {
    IdType: `EAN`,
    ItemId: isbn,
    SearchIndex: `Books`,
    ResponseGroup: `ItemAttributes,OfferFull,Images`
  };
  const requestUrl = `${req.protocol}://${req.headers.host}`;
  const config = {
    libraccio: `${requestUrl}/libraccio/${isbn}`,
    mondadori: `${requestUrl}/mondadori/${isbn}`,
    lafeltrinelli: `${requestUrl}/lafeltrinelli/${isbn}`
  };
  const bookData = {
    isbn: [isbn.slice(0, 3), `-`, isbn.slice(3)].join('')
  };

  amazonData.execute('ItemLookup', amazonConfig)
    .then((response) => {
      const amazonBookData = response.result.ItemLookupResponse.Items.Item;

      bookData.title = amazonBookData.ItemAttributes.Title;
      bookData.author = amazonBookData.ItemAttributes.Author;
      bookData.publisher = amazonBookData.ItemAttributes.Publisher;
      bookData.imgURL = amazonBookData.LargeImage.URL;

      if (amazonBookData.Offers) {
        bookData.amazon = {
          price: amazonBookData.OfferSummary.LowestNewPrice.FormattedPrice.split(' ')[1],
          availability: true,
          link: amazonBookData.DetailPageURL
        }
      } else {
        bookData.amazon = {
          price: amazonBookData.ItemAttributes.ListPrice.FormattedPrice.split(' ')[1],
          availability: false,
          link: amazonBookData.DetailPageURL
        }
      }

      fetchBooksData(config).then((response) => {
        try {
          Object.keys(config).forEach((book, index) => {
            bookData[book] = response[index];
          })

          console.log(bookData);
    
          res.json(bookData);
        } catch (error) {
          res.json(errors.productNotAvailable());
        }
      })

  }).catch((err) => {
      res.json(errors.productNotAvailable());
  });
});

module.exports = router;