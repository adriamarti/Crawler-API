const express = require('express');
const app = express();
const morgan = require('morgan');
const errors = require('./errors/errors');

const libraccioRoutes = require('./api/routes/libraccio');
const mondadoriRoutes = require('./api/routes/mondadori');
const lafeltrinelliRoutes = require('./api/routes/lafeltrinelli');

// Logs requests
app.use(morgan('dev'));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requestes-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET');
    return res.status(200).json({})
  }

  next();
})

// Routes that handle requests
app.use('/libraccio', libraccioRoutes);
app.use('/mondadori', mondadoriRoutes);
app.use('/lafeltrinelli', lafeltrinelliRoutes);

// Handle errors
app.use((req, res, next) => {
  next(errors.notFound())
});
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  })
});

module.exports = app;