var express = require('express');

var mdAuth = require('../middlewares/authentication');
var mdAuthArray = [
    mdAuth.verifyToken
];

var app = express();
var Hospital = require('../models/hospital');

// -----------------------------------------------------
// Obtener todos los usuarios
// -----------------------------------------------------
app.get('/', (req, res, next) => {

    var from = req.query.from || 0;
    from = Number(from);

    Hospital.find({})
        .populate('user', 'firstname lastname email')
        .skip(from)
        .limit(5)
        .exec(
            (err, hospitals) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        msg: 'Error Cargango Hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, count) => {
                    res.status(200).json({
                        ok: true,
                        total: count,
                        hospitals: hospitals
                    });
                });


            });

});
// -----------------------------------------------------
// Crear un nuevo hospital
// -----------------------------------------------------
app.post('/', mdAuthArray, (req, res) => {

    var body = req.body;
    var hospital = new Hospital({
        name: body.name,
        user: req.user._id
    });

    hospital.save((err, hospital) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al crear el hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospital
        });
    });

});
// -----------------------------------------------------
// Actualizar un hospital
// -----------------------------------------------------
app.put('/:id', mdAuthArray, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                msg: 'El hospital con el id ' + id + ' no existe.',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.name = body.name;
        hospital.user = req.user._id;
        //   hospital.img = body.img;

        hospital.save((err, hospital) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Error al actualizar el hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        });
    });

});
// -----------------------------------------------------
// Eliminar un hospital
// -----------------------------------------------------
app.delete('/:id', mdAuthArray, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al borrar el hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                msg: 'El hospital con el id ' + id + ' no existe.',
                errors: { message: 'No encontro ese id ' + id + ' para eliminar' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospital
        });
    });
});


module.exports = app;