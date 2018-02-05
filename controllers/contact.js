'use strict'

// modulos
var nodemailer = require("nodemailer");

// Configuración del servidor SMTP
var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "micorreo@gmail.com",
        pass: "micontraseña"
    }
});


// acciones

function send(req, res){
	var name = req.body.name;	
	var email = req.body.email;	
	var message = req.body.message;	
	
	if(email && name && message){
		var mailOptions={
			to: 'micorreo@gmail.com',
			from: email,
			subject: 'Mensaje de contacto',
			html: buildMail(name, email, message)
		}

			smtpTransport.sendMail(mailOptions, function(error, response){
			if(error){
				console.log(error);
				res.status(500).send({message: 'Error en la petición'});
			}else{
				console.log('Mensaje enviado');
				res.status(200).send({message: 'sent'});
				}
		});
	}
	
}

function buildMail(name, email, message){
	return '<h1>Mensaje de '+name+'</h1><h2>Correo electrónico: '+email+'</h2><hr /><h3>Mensaje:<h3/><p>'+message+'</p>';
}

module.exports = {
	send
};