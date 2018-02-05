'use strict'

var express = require('express');
var ContactContoller = require('../controllers/contact');

var api = express.Router();

var multipart = require('connect-multiparty');

api.post('/contact', ContactContoller.send);

module.exports = api;