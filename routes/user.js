var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAuth = require('../middlewares/authentication');
var mdAuthArray = [
    mdAuth.verifyToken
];

var app = express();
var User = require('../models/user');




// -----------------------------------------------------
// Obtener todos los usuarios
// -----------------------------------------------------
app.get('/', (req, res, next) => {

    User.find({}, 'firstname lastname email img, role')
        .exec(
            (err, users) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        msg: 'Error Cargango Usuarios',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    users: users
                });

            });

});
// -----------------------------------------------------
// Crear un nuevo usuario
// -----------------------------------------------------
app.post('/', mdAuthArray, (req, res) => {

    var body = req.body;
    var user = new User({
        firstname: body.firstname,
        lastname: body.lastname,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            user: user,
            userTokem: req.user
        });
    });

});
// -----------------------------------------------------
// Actualizar un usuario
// -----------------------------------------------------
app.put('/:id', mdAuthArray, (req, res) => {

    var id = req.params.id;
    var body = req.body;
    //  5eb8c861be3723090f2838f7

    User.findById(id, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario con el id ' + id + ' no existe.',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        user.firstname = body.firstname;
        user.lastname = body.lastname;
        user.email = body.email;
        user.role = body.role;

        user.save((err, user) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Error al actualizar usuario',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                user: user
            });
        });
    });

});
// -----------------------------------------------------
// Eliminar un usuario
// -----------------------------------------------------
app.delete('/:id', mdAuthArray, (req, res) => {
    var id = req.params.id;

    User.findByIdAndRemove(id, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al borrar el usuario',
                errors: err
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario con el id ' + id + ' no existe.',
                errors: { message: 'No encontro ese id ' + id + ' para eliminar' }
            });
        }

        res.status(200).json({
            ok: true,
            user: user
        });
    });
});

module.exports = app;