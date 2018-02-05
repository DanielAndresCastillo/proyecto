'use strict'

var express = require('express');
var UserContoller = require('../controllers/user');

var api = express.Router();
var md_auth = require('../middlewares/authenticated'); 

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users' });

api.get('/pruebas-del-controlador', md_auth.ensureAuth, UserContoller.pruebas);
api.post('/register', UserContoller.saveUser);
api.post('/login', UserContoller.login);
api.put('/update-user/:id', md_auth.ensureAuth, UserContoller.updateUser);
api.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], UserContoller.uploadImage);
api.get('/get-image-file/:imageFile', UserContoller.getImageFile);
api.get('/keepers', UserContoller.getKeepers);
api.post('/send', UserContoller.send);
api.post('/verify', UserContoller.verify);
api.post('/forgot', UserContoller.forgot);
api.post('/reset', UserContoller.reset);

module.exports = api;