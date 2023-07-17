const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    DocId: { type: String, required: true },
    UserId: { type: String , required: true },
    Date: {type: String , required: true},
    Day: { type: String , required:true },
    TimeSlot: { type: String, required: true },
    Fare: { type: Number , required:true },
    Status: { type: Boolean , default:true},
    CreatedAt: { type : Date , default:Date.now }
}, { collection: 'bookings' });

const BookingModel = mongoose.model('Booking', BookingSchema);

module.exports = BookingModel;
