const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number },
    gender: { type: String },
    regno: { type: String },
    specialization: { type: String },
    experience: { type: Number},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileimg: { type: String, required: true },
    certificate: { type: String},
    fare:{ type : Number },
    status: { type: Boolean, default: false },
    token : {type: String , default:''},
    approval: {type: Boolean , default:false}
}, { collection: 'doctors' });

const DoctorModel = mongoose.model('Doctor', DoctorSchema);

module.exports = DoctorModel;
