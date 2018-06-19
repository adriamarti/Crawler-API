const express = require('express');
const app = express();

const libraccioRoutes = require('./api/routes/libraccio');

app.use('/libraccio', libraccioRoutes);

module.exports = app;