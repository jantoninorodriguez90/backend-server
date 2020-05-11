// Requires
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// Conexion a la db
mongoose.connection.openUri('mongodb://localhost:27017/db_hospital', (err, res) => {
    if (err) throw err;
    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'online');
});

// rutas
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        msg: 'Peticion realizada correctamente'
    })

});

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server is running in port 3000: \x1b[32m%s\x1b[0m', 'online');
})