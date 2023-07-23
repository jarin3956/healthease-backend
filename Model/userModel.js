const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number },
    height: { type: Number },
    weight: { type: Number },
    gender: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    wallet: { type: Number, default: 0 },
    status: { type: Boolean, default: false },
    token : {type: String , default:''},
    CreatedAt: { type : Date , default:Date.now }
}, { collection: 'users' });

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
