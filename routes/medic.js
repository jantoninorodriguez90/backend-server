var express = require('express');

var mdAuth = require('../middlewares/authentication');
var mdAuthArray = [
    mdAuth.verifyToken
];

var app = express();
var Medic = require('../models/medic');

// -----------------------------------------------------
// Obtener todos los medicos
// -----------------------------------------------------
app.get('/', (req, res, next) => {

    var from = req.query.from || 0;
    from = Number(from);

    Medic.find({})
        .populate('user', 'firstname lastname email')
        .populate('hospital')
        .skip(from)
        .limit(5)
        .exec(
            (err, medics) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        msg: 'Error Cargango Medicos',
                        errors: err
                    });
                }


                Medic.count({}, (err, count) => {
                    res.status(200).json({
                        ok: true,
                        total: count,
                        medics: medics
                    });
                });

            });

});
// -----------------------------------------------------
// Crear un nuevo medico
// -----------------------------------------------------
app.post('/', mdAuthArray, (req, res) => {

    var body = req.body;
    var medic = new Medic({
        name: body.name,
        user: req.user._id,
        hospital: body.hospital
    });

    medic.save((err, medic) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al crear el medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medic: medic
        });
    });

});
// -----------------------------------------------------
// Actualizar un medico
// -----------------------------------------------------
app.put('/:id', mdAuthArray, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medic.findById(id, (err, medic) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al buscar el medico',
                errors: err
            });
        }

        if (!medic) {
            return res.status(400).json({
                ok: false,
                msg: 'El medico con el id ' + id + ' no existe.',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medic.name = body.name;
        medic.user = req.user._id;
        medic.hospital = body.hospital

        medic.save((err, medic) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Error al actualizar el medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medic: medic
            });
        });
    });

});
// -----------------------------------------------------
// Eliminar un medico
// -----------------------------------------------------
app.delete('/:id', mdAuthArray, (req, res) => {
    var id = req.params.id;

    Medic.findByIdAndRemove(id, (err, medic) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al borrar el medico',
                errors: err
            });
        }

        if (!medic) {
            return res.status(400).json({
                ok: false,
                msg: 'El medico con el id ' + id + ' no existe.',
                errors: { message: 'No encontro ese id ' + id + ' para eliminar' }
            });
        }

        res.status(200).json({
            ok: true,
            medic: medic
        });
    });
});


module.exports = app;