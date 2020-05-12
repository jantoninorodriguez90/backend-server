var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var medicSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hospital: {
        type: Schema.Types.ObjectId,
        ref: 'Hospital',
        required: [true, 'El id hospital es un campo obligatorio ']
    }
}, { collation: 'Medics' });

module.exports = mongoose.model('Medic', medicSchema);