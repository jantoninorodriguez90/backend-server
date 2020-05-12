var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var User = require('../models/user');

// GOOGLE
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
// -----------------------------------------------------
// Autenticacion con Google
// -----------------------------------------------------
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        auth: 'google',
        payload
    }
}
app.post('/google', async(req, res) => {
    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                msg: 'Token no valido',
                errors: err
            });
        });

    User.findOne({ email: googleUser.email }, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al buscar usuario',
                errors: err
            });
        }

        if (user) {
            // cuando el usuario ya existe, hay que validar que autenticacion utilizo
            switch (user.auth) {
                case 'google':
                    var token = jwt.sign({ user: user }, SEED, { expiresIn: 31540000000000 });

                    res.status(200).json({
                        ok: true,
                        user: user,
                        id: user._id,
                        token: token
                    });
                    break;

                default:
                    return res.status(400).json({
                        ok: false,
                        msg: 'Debe de usar su atenticacion con la que ya fue registrado.'
                    });
                    break;
            }
        } else {
            // El usario no existe, hay que crearlo
            var user = new User();
            var arrayGoogleUserName = googleUser.name.split(" ");

            user.firstname = arrayGoogleUserName[0];
            user.lastname = arrayGoogleUserName[1];
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.auth = googleUser.auth;
            user.password = '-';

            user.save((err, user) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        msg: 'Error al guardar usuario',
                        errors: err
                    });
                }
                var token = jwt.sign({ user: user }, SEED, { expiresIn: 31540000000000 });

                res.status(200).json({
                    ok: true,
                    user: user,
                    id: user._id,
                    token: token
                });
            });

        }
    });

    // return res.status(200).json({
    //     ok: true,
    //     message: 'Realizando pruebas',
    //     data: googleUser
    // });

});
// -----------------------------------------------------
// Autenticacion Normal
// -----------------------------------------------------
app.post('/', (req, res) => {
    var body = req.body;

    User.findOne({ email: body.email }, (err, user) => {
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
                msg: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, user.password)) {
            return res.status(400).json({
                ok: false,
                msg: 'Credenciales incorrectas - pass',
                errors: err
            });
        }
        // -----------------------------------------------------
        // CREAR TOKEN 
        // -----------------------------------------------------
        user.password = '';
        var token = jwt.sign({ user: user }, SEED, { expiresIn: 31540000000000 });

        res.status(200).json({
            ok: true,
            user: user,
            id: user._id,
            token: token
        });
    });
});


module.exports = app;