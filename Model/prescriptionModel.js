const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
    bookingId: { type : String , required: true } ,
    userId: { type : String , required: true } ,
    docId: { type : String , required: true } ,
    description: { type : String , required: true} ,
    prescription: { type : String , required: true } ,
    recomentation: {type : String } ,
    createdAt: { type : Date , default:Date.now }
}, { collection: 'prescription' });

const PrescriptionModel = mongoose.model('Prescription', PrescriptionSchema);

module.exports = PrescriptionModel;
