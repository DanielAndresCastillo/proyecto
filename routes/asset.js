'use strict'

var express = require('express');
var AssetContoller = require('../controllers/asset');

var api = express.Router();
var md_auth = require('../middlewares/authenticated'); 
var md_admin = require('../middlewares/is_admin'); 

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/assets' });

api.get('/pruebas-assets', md_auth.ensureAuth, AssetContoller.pruebas);
api.post('/asset', [md_auth.ensureAuth, md_admin.isAdmin], AssetContoller.saveAsset);
api.get('/assets', AssetContoller.getAssets);
api.get('/asset/:id', AssetContoller.getAsset);
api.put('/asset/:id', [md_auth.ensureAuth, md_admin.isAdmin], AssetContoller.updateAsset);
api.post('/upload-image-asset/:id', [md_auth.ensureAuth, md_admin.isAdmin, md_upload], AssetContoller.uploadImage);
api.get('/get-image-asset/:imageFile', AssetContoller.getImageFile);
api.delete('/asset/:id', [md_auth.ensureAuth, md_admin.isAdmin], AssetContoller.deleteAsset);

module.exports = api;