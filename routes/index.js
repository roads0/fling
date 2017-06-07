const express = require('express');
const config = require('../config');
const index = express.Router();

index.get('/', (req, res) => {
  res.render('index');
});

module.exports = index
