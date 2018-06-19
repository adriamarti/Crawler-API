const express = require('express');
const app = express();

const libraccioRoutes = require('./api/routes/libraccio');
const mondadoriRoutes = require('./api/routes/mondadori')

app.use('/libraccio', libraccioRoutes);
app.use('/mondadori', mondadoriRoutes);

module.exports = app;