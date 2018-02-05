'use strict'

// modulos
var fs = require('fs');
var path = require('path');

// modelos
var User = require('../models/user');
var Asset = require('../models/asset');

// acciones
function pruebas(req, res){
	res.status(200).send({
		message: 'Probando el controlador de assets y la acción pruebas',
		user: req.user
	});
}

function saveAsset(req, res){
	var asset = new Asset();

	var params = req.body;

	if(params.name){
		asset.name = params.name;
		asset.description = params.description;
		asset.year = params.year;
		asset.image = null;
		asset.user = req.user.sub;
		asset.lat = params.lat;
		asset.lng = params.lng;

		asset.save((err, assetStored) => {
			if(err){
				res.status(500).send({message: 'Error en el servidor'});
			}else{
				if(!assetStored){
					res.status(404).send({message: 'No se ha guardado el asset'});
				}else{
					res.status(200).send({asset: assetStored});
				}
			}
		});

	}else{
		res.status(200).send({
			message: 'El nombre del asset es obligatorio'
		});
	}
}

function getAssets(req, res){
	Asset.find({}).populate({path: 'user'}).exec((err, assets) => {
		if(err){
			res.status(500).send({
				message: 'Error en la petición'
			});
		}else{
			if(!assets){
				res.status(404).send({
					message: 'No hay assets'
				});
			}else{
				res.status(200).send({
					assets
				});
			}
		}
	});
}

function getAsset(req, res){
	var assetId = req.params.id;

	Asset.findById(assetId).populate({path: 'user'}).exec((err, asset) => {
		if(err){
			res.status(500).send({
				message: 'Error en la petición'
			});
		}else{
			if(!asset){
				res.status(404).send({
					message: 'El asset no existe'
				});
			}else{
				res.status(200).send({
					asset
				});
			}
		}
	});
}

function updateAsset(req, res){
	var assetId = req.params.id;
	var update = req.body;

	Asset.findByIdAndUpdate(assetId, update, {new:true}, (err, assetUpdated) => {
		if(err){
			res.status(500).send({
				message: 'Error en la petición'
			});
		}else{
			if(!assetUpdated){
				res.status(404).send({
					message: 'No se ha actualizado el asset'
				});
			}else{
				res.status(200).send({asset: assetUpdated});
			}
		}
	});
}

function uploadImage(req, res){
	var assetId = req.params.id;
	var file_name = 'No subido...';

	if(req.files){
		var file_path = req.files.image.path;
		var file_split = file_path.split('/');
		var file_name = file_split[2];

		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){

			Asset.findByIdAndUpdate(assetId, {image: file_name}, {new:true}, (err, assetUpdated) => {
				if(err){
					res.status(500).send({
						message: 'Error al actualizar usuario'
					});
				}else{
					if(!assetUpdated){
						res.status(404).send({message: 'No se ha podido actualizar el asset'});
					}else{
						res.status(200).send({asset: assetUpdated, image: file_name});
					}
				}
			});

		}else{
			fs.unlink(file_path, (err) => {
				if(err){
					res.status(200).send({message: 'Extensión no valida y fichero no'});
				}else{
					res.status(200).send({message: 'Extensión no valida'});
				}
			});
		}

	}else{
		res.status(200).send({message: 'No se han subido archivos'});
	}
}

function getImageFile(req, res){
	var imageFile = req.params.imageFile;
	var path_file = './uploads/assets/'+imageFile;

	fs.exists(path_file, function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(404).send({message: 'La imagen no existe'});
		}
	});
}

function deleteAsset(req, res){
	var assetId = req.params.id;

	Asset.findByIdAndRemove(assetId, (err, assetRemoved) => {
		if(err){
			res.status(500).send({message: 'Error en la petición'});
		}else{
			if(!assetRemoved){
				res.status(404).send({message: 'No se ha borrado el asset'});
			}else{
				res.status(200).send({asset: assetRemoved});
			}
		}
	});
}

module.exports = {
	pruebas,
	saveAsset,
	getAssets,
	getAsset,
	updateAsset,
	uploadImage,
	getImageFile,
	deleteAsset
};