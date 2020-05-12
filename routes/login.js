var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var User = require('../models/user');

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
        user.password = ':)';
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