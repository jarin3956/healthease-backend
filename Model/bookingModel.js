const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    DocId: { type: String, required: true },
    UserId: { type: String , required: true },
    Booked_date: {type: String , required: true},
    Booked_day: { type: String , required:true },
    Booked_timeSlot: { type: String, required: true },
    Fare: { type: Number , required:true },
    Payment_id:{ type:String , required:true },
    Payment_create_time:{ type:Date , required:true },
    Payment_update_time:{ type:Date , required:true },
    Status: { type: String , default:'PENDING'},
    CreatedAt: { type : Date , default:Date.now }
}, { collection: 'bookings' });

const BookingModel = mongoose.model('Booking', BookingSchema);

module.exports = BookingModel;
