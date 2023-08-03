const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name : { type : String, required: true },
    age : { type : Number },
    height : { type : Number },
    weight : { type : Number },
    gender : { type : String }, 
    email : { type : String, required : true, unique: true },
    password : { type : String, required : true },
    image : { type : String, required : true },
    wallet: [
        {
          amount: { type: Number, required: true },
          timestamp: { type: Date, default: Date.now },
          type: { type: String, enum: ['C', 'D'], required: true }, 
        },
      ],
    status : { type : Boolean, default : false },
    token : {type : String , default :''},
    createdAt : { type : Date , default : Date.now },
    isBlocked : { type : Boolean ,default : false }
}, { collection: 'users' });

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
