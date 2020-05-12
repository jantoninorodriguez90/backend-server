var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();

var User = require('../models/user');
var Medic = require('../models/medic');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:type/:id', (req, res, next) => {

    var type = req.params.type;
    var id = req.params.id;

    // Validando que venga un archivo en la url
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // Validar tipo de Collections
    var typeValidate = ['hospitals', 'medics', 'users'];
    if (typeValidate.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Tipo de Collection no valida',
            errors: { message: 'Las collections validas son las siguientes ' + typeValidate }
        });
    }

    // Obteniendo nombre del archivo
    var file = req.files.imagen;
    var namefile = file.name.split('.');
    var extensionFile = namefile[namefile.length - 1];

    // Validacion de extensiones
    var extensionArray = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionArray.indexOf(extensionFile) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Extension no vlaida',
            errors: { message: 'Las extensiones validas son ' + extensionArray }
        });
    }

    // Personalizar el nombre del archivo al subir
    var newfile = `${ id }-${ new Date().getMilliseconds() }.${ extensionFile }`;


    uploadByType(type, id, newfile, res).then(
        data => {
            // Mover el archivo temporal a un path
            var path = `./uploads/${ type }/${ newfile }`;
            file.mv(path, err => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al mover archvio',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    message: `Imagen de ${ type } actualizado`,
                    [type]: data
                });
            });
        }
    );

});

function uploadByType(type, id, file, res) {

    switch (type) {
        case 'users':
            return new Promise((resolve, reject) => {
                User.findById(id, (err, user) => {
                    if (user == null) {
                        return res.status(500).json({
                            ok: false,
                            message: 'Usuario no existente',
                            errors: { message: 'Verificar el id del usuario' }
                        });
                    }

                    var oldPath = `./uploads/${ type }/${ user.img }`;
                    // Eliminar path viejo
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }

                    user.img = file;
                    user.password = '';
                    user.save((err, user) => {
                        if (err) {
                            reject('Error al actualizar la imagen', err);
                        } else {
                            resolve(user);
                        }
                    });

                });
            });
            break;

        case 'medics':
            return new Promise((resolve, reject) => {
                Medic.findById(id, (err, medic) => {
                    if (medic == null) {
                        return res.status(500).json({
                            ok: false,
                            message: 'Medico no existente',
                            errors: { message: 'Verificar el id del medico' }
                        });
                    }

                    var oldPath = `./uploads/${ type }/${ medic.img }`;
                    // Eliminar path viejo
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }

                    medic.img = file;
                    medic.save((err, medic) => {
                        if (err) {
                            reject('Error al actualizar la imagen', err);
                        } else {
                            resolve(medic);
                        }
                    });

                });
            });
            break;

        case 'hospitals':
            return new Promise((resolve, reject) => {
                Hospital.findById(id, (err, hospital) => {
                    if (hospital == null) {
                        return res.status(500).json({
                            ok: false,
                            message: 'Hospital no existente',
                            errors: { message: 'Verificar el id del hospital' }
                        });
                    }

                    var oldPath = `./uploads/${ type }/${ hospital.img }`;
                    // Eliminar path viejo
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }

                    hospital.img = file;
                    hospital.save((err, hospital) => {
                        if (err) {
                            reject('Error al actualizar la imagen', err);
                        } else {
                            resolve(hospital);
                        }
                    });

                });
            });
            break;

    }

}

module.exports = app;