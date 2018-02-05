'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = Schema({
	name: String,
	surname: String,
	email: String,
	password: String,
	image: String,
	role: String,
	activated: {
        type: Boolean,
        default: false
    },
	resetPasswordToken: String,
	resetPasswordExpires: Date
});

module.exports = mongoose.model('User', UserSchema);