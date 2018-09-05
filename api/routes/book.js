const express = require('express');
const router = express.Router();
const errors = require('../../errors/errors');
const libraccioService = require('../services/libraccio');
const mondadoriService = require('../services/mondadori');
const lafeltrinelliService = require('../services/lafeltrinelli');
const { OperationHelper } = require('apac');

const amazonData = new OperationHelper({
  awsId:     'AKIAJAVMDR2LKXU6C4OQ',
  awsSecret: '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',
  assocId:   'lettura-21',
  locale:    'IT'
});

function defineBestPrice(bookData) {
  let newBookData = bookData;

  const storesPrice = [
    { name: `amazon`, price: newBookData.amazon.price },
    { name: `libraccio`, price: newBookData.libraccio.price },
    { name: `mondadori`, price: newBookData.mondadori.price },
    { name: `lafeltrinelli`, price: newBookData.lafeltrinelli.price }
  ];
  storesPrice.sort(function (a, b) {
    if (a.price > b.price && a.price !== 0 && b.price !== 0) {
      return 1;
    }
    if (a.price < b.price && a.price !== 0 && b.price !== 0) {
      return -1;
    }
    if (a.price === 0) {
      return 1;
    }
    // a must be equal to b
    return 0;
  });
  
  storesPrice.forEach((storePrice, index) => {
    newBookData[storePrice.name].order = index + 1;
    if (newBookData[storePrice.name].availability === false) {
      newBookData[storePrice.name].bestOffer = false;
    } else if (newBookData[storePrice.name].price === storesPrice[0].price) {
      newBookData[storePrice.name].bestOffer = true;
    } else {
      newBookData[storePrice.name].bestOffer = false;
    }
  })

  return newBookData;
}

function fetchBooksData(isbn) {
  return Promise.all([
    libraccioService(isbn),
    mondadoriService(isbn),
    lafeltrinelliService(isbn)
  ]);
}

router.get('/:isbn', (req, res, next) => {
  const isbn = req.params.isbn
  const amazonConfig = {
    IdType: `EAN`,
    ItemId: isbn,
    SearchIndex: `Books`,
    ResponseGroup: `ItemAttributes,OfferFull,Images,Similarities`
  };

  const bookData = {
    isbn: [isbn.slice(0, 3), `-`, isbn.slice(3)].join('')
  };

  amazonData.execute('ItemLookup', amazonConfig)
    .then((response) => {
      let amazonBookData = {};

      if (Array.isArray(response.result.ItemLookupResponse.Items.Item)) {
        const index = response.result.ItemLookupResponse.Items.Item.length - 1;
        amazonBookData = response.result.ItemLookupResponse.Items.Item[index];
      } else {
        amazonBookData = response.result.ItemLookupResponse.Items.Item;
      }

      bookData.title = amazonBookData.ItemAttributes.Title;
      bookData.author = amazonBookData.ItemAttributes.Author;
      bookData.publisher = amazonBookData.ItemAttributes.Publisher;
      bookData.imgURL = amazonBookData.LargeImage ? amazonBookData.LargeImage.URL : false;
      bookData.similarBooks = amazonBookData.SimilarProducts.SimilarProduct

      if (amazonBookData.OfferSummary && amazonBookData.OfferSummary.LowestNewPrice) {
        const priceString = amazonBookData.OfferSummary.LowestNewPrice.FormattedPrice.split(' ')[1];

        bookData.amazon = {
          price: parseFloat(priceString.replace(',', '.')),
          availability: true,
          link: amazonBookData.DetailPageURL
        }
      } else {
        const priceString = amazonBookData.ItemAttributes.ListPrice.FormattedPrice.split(' ')[1];

        bookData.amazon = {
          price: parseFloat(priceString.replace(',', '.')),
          availability: false,
          link: amazonBookData.DetailPageURL
        }
      }

      fetchBooksData(isbn).then((response) => {
        try {
          response.forEach((storeData) => {
            bookData[storeData.storeName] = {
              price: storeData.price,
              availability: storeData.availability,
              link: storeData.link
            };
          })
          
          res.json(defineBestPrice(bookData));
        } catch (error) {
          res.json({isbn: null});
        }
      })

  }).catch((err) => {
      res.json({isbn: null});
  });
});

module.exports = router;