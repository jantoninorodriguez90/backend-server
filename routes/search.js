var express = require('express');
var app = express();

var hospital = require('../models/hospital');
var medic = require('../models/medic');
var user = require('../models/user');
// -----------------------------------------------------
// Busqueda Expesifica - Collection
// -----------------------------------------------------
app.get('/collection/:table/:search', (req, res) => {

    var table = req.params.table;
    var search = req.params.search;
    var regex = new RegExp(search, 'i');

    var promise;

    switch (table) {
        case "users":
            promise = searchUsers(search, regex)
            break;
        case "hospitals":
            promise = searchHospitals(search, regex);
            break;
        case "medics":
            promise = searchMedics(search, regex);
            break;
        default:
            res.status(400).json({
                ok: false,
                message: "Los tipos de busqueda solo son: users, hospitals and medics"
            });
            break;
    }

    promise.then(
        data => {
            res.status(200).json({
                ok: true,
                [table]: data
            });
        }
    );

});
// -----------------------------------------------------
// Busqueda General
// -----------------------------------------------------
app.get('/all/:search', (req, res, next) => {

    var search = req.params.search;
    var regex = new RegExp(search, 'i');

    Promise.all(
        [searchHospitals(search, regex), searchMedics(search, regex), searchUsers(search, regex)]
    ).then(
        data => {
            res.status(200).json({
                ok: true,
                hospitals: data[0],
                medics: data[1],
                users: data[2]
            });
        }
    );

});

function searchHospitals(search, regex) {

    return new Promise((resolve, reject) => {
        hospital.find({ name: regex })
            .populate('user', 'firstaname lastname email')
            .exec((err, hospitals) => {

                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitals);
                }

            });
    });

}

function searchMedics(search, regex) {

    return new Promise((resolve, reject) => {
        medic.find({ name: regex })
            .populate('user', 'firstname lastname email')
            .populate('hospital')
            .exec((err, medic) => {

                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medic);
                }

            });
    });

}

function searchUsers(search, regex) {

    return new Promise((resolve, reject) => {
        user.find({}, 'firstname lastname email role')
            .or({ 'firstname': regex }, { 'lastname': regex }, { 'email': regex })
            .exec((err, user) => {

                if (err) {
                    reject('Error al cargar usuario', err);
                } else {
                    resolve(user);
                }

            });
    });

}


module.exports = app;