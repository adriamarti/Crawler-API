const express = require('express');
const app = express();
const morgan = require('morgan');

const libraccioRoutes = require('./api/routes/libraccio');
const mondadoriRoutes = require('./api/routes/mondadori');

// Logs requests
app.use(morgan('dev'));

// Routes that handle requests
app.use('/libraccio', libraccioRoutes);
app.use('/mondadori', mondadoriRoutes);

// Handle errors
app.use((req, res, next) => {
  const error = new Error(`Not Found`);
  error.status = 404;
  next(error)
})

module.exports = app;