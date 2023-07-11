const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: Boolean, default: false },
    token : {type: String , default:''}
}, { collection: 'admin' });

const AdminModel = mongoose.model('Admin', AdminSchema);

module.exports = AdminModel;
