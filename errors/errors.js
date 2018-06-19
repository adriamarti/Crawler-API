const errors = {
  productNotAvailable: () => {
    const error = new Error(`Not available`);
    return {
      error: {
        message: error.message
      }
    }
  },
  notFound: () => {
    const error = new Error(`Not Found`);
    error.status = 404;
    return error
  }
}

module.exports = errors;