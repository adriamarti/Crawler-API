const errors = {
  productNotAvailable: () => {
    return new Error(`Not available`);
  },
  notFound: () => {
    return new Error(`Not Found`);
  }
};

module.exports = errors;