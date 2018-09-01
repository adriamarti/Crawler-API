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
  let newBookData = bookData
  let bestPrice = +bookData.amazon.price.replace(',', '')
  let bestPriceStore = [`amazon`]
  const prices = {
    libraccio: +bookData.libraccio.price.replace(',', ''),
    mondadori: +bookData.mondadori.price.replace(',', ''),
    lafeltrinelli: +bookData.lafeltrinelli.price.replace(',', '')
  };

  Object.keys(prices).forEach((store) => {
    if (prices[store] < bestPrice && bookData[store].availability) {
      bestPrice = prices[store];
      bestPriceStore = [store];
    } else if (prices[store] === bestPrice && bookData[store].availability) {
      bestPrice = prices[store];
      bestPriceStore.push(store);
    }
  })

  bestPriceStore.forEach((store) => {
    newBookData[store].bestOffer = true;
  })

  if (!newBookData.amazon.bestOffer) newBookData.amazon.bestOffer = false;
  if (!newBookData.libraccio.bestOffer) newBookData.libraccio.bestOffer = false;
  if (!newBookData.mondadori.bestOffer) newBookData.mondadori.bestOffer = false;
  if (!newBookData.lafeltrinelli.bestOffer) newBookData.lafeltrinelli.bestOffer = false;

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
      const amazonBookData = response.result.ItemLookupResponse.Items.Item;

      bookData.title = amazonBookData.ItemAttributes.Title;
      bookData.author = amazonBookData.ItemAttributes.Author;
      bookData.publisher = amazonBookData.ItemAttributes.Publisher;
      bookData.imgURL = amazonBookData.LargeImage.URL;
      bookData.similarBooks = amazonBookData.SimilarProducts.SimilarProduct

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