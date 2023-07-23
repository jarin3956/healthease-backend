const mongoose = require('mongoose');

const specializationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: {type: String,required: true},
    status: { type: Boolean, default: true },
    CreatedAt: { type : Date , default:Date.now }
}, { collection: 'specialization' });

const SpecializationModel = mongoose.model('Specialization', specializationSchema);

module.exports = SpecializationModel;