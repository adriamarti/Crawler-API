const errors = {
  productNotAvailable: function() {
    return new Error(`Not available`);
  },
  notFound: function() {
    return new Error(`Not Found`);
  }
};

module.exports = errors;