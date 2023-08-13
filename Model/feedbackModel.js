const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    bookingId: { type : String , required: true } ,
    userId: { type : String , required: true } ,
    docId: { type : String , required: true } ,
    rating: { type : Number , required: true } ,
    comments : {type : String , required: true} ,
    createdAt: { type : Date , default:Date.now }
}, { collection: 'feedback' });

const FeedbackModel = mongoose.model('Feedback', FeedbackSchema);

module.exports = FeedbackModel;
