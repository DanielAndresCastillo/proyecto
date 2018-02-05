'use strict'

// modulos
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');
var nodemailer = require("nodemailer");
var crypto = require('crypto');
var async = require('async');

// modelos
var User = require('../models/user');

// servicio jwt
var jwt = require('../services/jwt');

// Variables nodemailer
var rand, host, userId;

// Configuración del servidor SMTP
var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: 'micorreo@gmail.com',
        pass: 'micontraseña'
    }
});

// acciones
function pruebas(req, res){
	res.status(200).send({
		message: 'Probando el controlador de usuarios y la acción pruebas',
		user: req.user
	});
}

function saveUser(req, res){

	// Crear objeto usuario
	var user = new User();

	// Recoger parametros peticion
	var params = req.body;

	if(params.password && params.name && params.surname && params.email){
		
		// Asignar valores al objeto de usuario
		user.name = params.name;
		user.surname = params.surname;
		user.email = params.email;
		user.role = 'ROLE_USER';
		user.image = null;
		user.activated = false;

		User.findOne({email: user.email.toLowerCase()}, (err, issetUser) => {
			if(err){
				res.status(500).send({message: 'Error al comprobar el usuario'});
			}else{
				if(!issetUser){

					// Cifrar contraseña
					bcrypt.hash(params.password, null, null, function(err, hash){
						user.password = hash;

						// Guardar usuario en bd
						user.save((err, userStored) => { 
							if(err){
								res.status(500).send({message: 'Error al guardar el usuario'});
							}else{
								if(!userStored){
									res.status(404).send({message: 'No se ha registrado el usuario'});
								}else{
									res.status(200).send({user: userStored});
								}
							}
						});

					});

				}else{
					res.status(200).send({
						message: 'El usuario no puede registrarse'
					});
				}
			}
		});


	}else{
		res.status(200).send({
			message: 'Introduce los datos correctamente para poder registrar al usuario'
		});
	}
}

function login(req, res){
	var params = req.body;

	var email = params.email;
	var password = params.password;

	User.findOne({email: email.toLowerCase()}, (err, user) => {
			if(err){
				res.status(500).send({message: 'Error al comprobar el usuario'});
			}else{
				if(user){
					bcrypt.compare(password, user.password, (err, check) => {
						if(check){

							if(params.gettoken){
								//devolver token jwt
								res.status(200).send({
									token: jwt.createToken(user)
								});
							}else{
								res.status(200).send({user});
							}
							
						
						}else{
							res.status(404).send({
								message: 'El usuario no ha podido loguearse correctamente'
							});
						}
					});
					
				}else{
					res.status(404).send({
						message: 'El usuario no ha podido loguearse'
					});
				}
			}
	});

}

function updateUser(req, res){
	var userId = req.params.id;
	var update = req.body;
	delete update.password;
	
	if(userId != req.user.sub){
		return res.status(500).send({message: 'No tienes permiso para actualizar el usuario'});
	}

	User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdated) => {
		if(err){
			res.status(500).send({
				message: 'Error al actualizar usuario'
			});
		}else{
			if(!userUpdated){
				res.status(404).send({message: 'No se ha podido actualizar el usuario'});
			}else{
				res.status(200).send({user: userUpdated});
			}
		}
	});

}

function uploadImage(req, res){
	var userId = req.params.id;
	var file_name = 'No subido...';

	if(req.files){
		var file_path = req.files.image.path;
		var file_split = file_path.split('/');
		var file_name = file_split[2];

		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){

			if(userId != req.user.sub){
				return res.status(500).send({message: 'No tienes permiso para actualizar el usuario'});
			}

			User.findByIdAndUpdate(userId, {image: file_name}, {new:true}, (err, userUpdated) => {
				if(err){
					res.status(500).send({
						message: 'Error al actualizar usuario'
					});
				}else{
					if(!userUpdated){
						res.status(404).send({message: 'No se ha podido actualizar el usuario'});
					}else{
						res.status(200).send({user: userUpdated, image: file_name});
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
	var path_file = './uploads/users/'+imageFile;

	fs.exists(path_file, function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(404).send({message: 'La imagen no existe'});
		}
	});
}

function getKeepers(req, res){
	User.find({role:'ROLE_ADMIN'}).exec((err, users) => {
		if(err){
			res.status(500).send({message: 'Error en la petición'});
		}else{
			if(!users){
				res.status(404).send({message: 'No hay inversores'});
			}else{
				res.status(200).send({users});
			}
		}
	});
}

function send(req, res){
	userId = req.body.userId;
	host = req.get('host');
	rand = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	
	var link = 'http://'+req.get('host')+'/api/verify/';
	
    smtpTransport.sendMail(getMailOptions(req.body.to,'Por favor, confirme la dirección de correo',buildVerifyMail(link,rand)), function(error, response){
		if(error){
			console.log(error);
			res.status(500).send({message: 'Error en la petición'});
		}else{
			console.log('Mensaje enviado');
			res.status(200).send({message: 'sent'});
			}
	});
}

function verify(req, res){
	if((req.protocol+"://"+req.get('host'))==("http://"+host))
	{
		console.log("El dominio coincide. La información es de un correo verdadero.");
		if(req.body.id==rand)
		{
			console.log("¡Correo verificado!");
			var update = {$set: {activated:true}};
			User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdated) => {
				if(err){
					res.status(500).send({message: 'Error al activar usuario'});
				}else{
					if(!userUpdated){
						res.status(404).send({message: 'No se ha podido activar el usuario'});
					}else{						
						res.redirect('http://localhost:4200/login');
					}
				}
			});
		}
		else
		{
			console.log("El correo no ha sido verificado");
			res.status(500).send({message: 'Correo no verificado.'});
		}
	}
	else
	{
		res.status(500).send({message: 'Origen de la petición desconocida.'});
	}
}

function forgot(req, res, next) {
	async.waterfall([
	  function(done) {
		crypto.randomBytes(20, function(err, buf) {
		  var token = buf.toString('hex');
		  done(err, token);
		});
	  },
	  function(token, done) {
		User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
		  if (!user) {
				return res.status(500).send({message: 'No existe una cuenta con ese correo electrónico.'});
		  }
  
		  user.resetPasswordToken = token;
		  user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
  
		  user.save(function(err) {
			done(err, token, user);
		  });
		});
	  },
	  function(token, user, done) {
		smtpTransport.sendMail(getMailOptions(user.email,'Restablecer contraseña',buildResetMail(token)), function(err) {
		  done(err, 'done');                
		});
	  }
	], function(err) {
	  if (err) return next(err);
	  res.status(200).send({message: 'success'});
	});
  }
  
  function reset(req, res) {
	async.waterfall([
	  function(done) {
		User.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
		  if (!user) {
				return res.status(500).send({message: 'El token para restablecer la contraseña es inválido o ha expirado.'});
		  }
  
		  user.resetPasswordToken = undefined;
		  user.resetPasswordExpires = undefined;
		  bcrypt.hash(req.body.user.password, null, null, function(err, hash){
				user.password = hash;
				user.save((err, userStored) => { 
					if(err){
						res.status(500).send({message: 'Error al guardar el usuario'});
					}else{
						if(!userStored){
							res.status(404).send({message: 'No se ha registrado el usuario'});
						}else{
							done(err, user);
						}
					}
				});
			});
  
		});
	  },
	  function(user, done) {
		smtpTransport.sendMail(getMailOptions(user.email, 'Su contraseña ha sido modificada',buildResetConfirmMail(user.email)), function(err) {
		  done(err);
		});
	  }
	], function(err) {
	  res.status(200).send({message: 'success'});   
	});
	}

function buildVerifyMail(link, id){
	return `<h1>Activación de usuario</h1>
			<hr />
			<h3>Por favor, verifique su cuenta de correo electrónico a través del siguiente enlace:</h3>
			<form method="post" action="`+link+`" class="inline">
				<input type="hidden" name="id" value="`+id+`" />
				<button type="submit" name="submit_id" value="Verificar correo electrónico" class="link-button" style="margin-left:auto;margin-right:auto;display:block;">
					Activar usuario
				</button>
			</form>`;
}

function buildResetMail(token){
	return `<h1>Restablecer contraseña</h1>
			<hr />
			<p>Está recibiendo esto porque usted (u otra persona) ha solicitado que se restablezca la contraseña de su cuenta.</p>
			<p>Haga clic en el siguiente enlace o pegue esto en su navegador para completar el proceso:</p>
			<a href="http://localhost:4200/reset/`+token+`">Restablecer contraseña</a>
			<p>Si no lo solicitó, ignore este correo electrónico y su contraseña no cambiará.</p>`;
}

function buildResetConfirmMail(mail){
	return `<h1>Clave de usuario restablecida</h1>
			<hr />
			<p>Hola,</p>
			<p>Esta es la confirmación de que la contraseña de su cuenta ` + mail + ` ha sido modificada.</p>`;
}

function getMailOptions(to, subject, html){
	return {
		to:to,
		subject: subject,
		html: html
	};
}

module.exports = {
	pruebas,
	saveUser,
	login,
	updateUser,
	uploadImage,
	getImageFile,
	getKeepers,
	send,
	verify,
	forgot,
	reset
};