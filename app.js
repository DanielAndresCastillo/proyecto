'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var app=express();


// cargar rutas
var user_routes = require('./routes/user');
var asset_routes = require('./routes/asset');
var contact_routes = require('./routes/contact'); //

// middlewares de body-parser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Configurar cabeceras y cors
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
	next();
});

// rutas base
app.use('/', express.static('client', {redirect: false}));
app.use('/api', user_routes);
app.use('/api', asset_routes);
app.use('/api', contact_routes); //

app.get('*', function (req, res, next){
	res.sendFile(path.resolve('client/index.html'));
});

module.exports = app;
