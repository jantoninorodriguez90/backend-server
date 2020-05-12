// -----------------------------------------------------
// Requires
// -----------------------------------------------------
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')

// -----------------------------------------------------
// Inicializar variables
// -----------------------------------------------------
var app = express();

// -----------------------------------------------------
// Body Parser
// parse application/x-www-form-urlencoded - parse application/json
// -----------------------------------------------------

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// -----------------------------------------------------
// Importar Rutas
// -----------------------------------------------------
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicRoutes = require('./routes/medic');
var searchRoutes = require('./routes/search');
var uploadRoutes = require('./routes/upload');
var imagesRoutes = require('./routes/imagenes');

// -----------------------------------------------------
// Server index config
// -----------------------------------------------------
var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'));
app.use('/uploads', serveIndex(__dirname + '/uploads'));

// -----------------------------------------------------
// Conexion a la db
// -----------------------------------------------------
mongoose.connection.openUri('mongodb://localhost:27017/db_hospital', (err, res) => {
    if (err) throw err;
    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'online');
});

// -----------------------------------------------------
// Rutas
// -----------------------------------------------------
app.use('/hospitals', hospitalRoutes);
app.use('/medics', medicRoutes);
app.use('/users', userRoutes);
app.use('/login', loginRoutes);
app.use('/search', searchRoutes);
app.use('/upload', uploadRoutes);
app.use('/images', imagesRoutes);
app.use('/', appRoutes);


// -----------------------------------------------------
// Escuchar peticiones
// -----------------------------------------------------
app.listen(3000, () => {
    console.log('Express Server is running in port 3000: \x1b[32m%s\x1b[0m', 'online');
})