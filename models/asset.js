'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AssetSchema = Schema({
	name: String,
	description: String,
	year: Number,
	image: String,
	user: { type: Schema.ObjectId, ref: 'User'},
	lat: Number,
	lng: Number
});

module.exports = mongoose.model('Asset', AssetSchema);