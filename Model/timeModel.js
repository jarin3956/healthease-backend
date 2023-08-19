const mongoose = require('mongoose');

const TimeSchema = new mongoose.Schema({
    time_slot: [{
        time: { type: String, required: true },
        isAvailable: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now }
    }],
    
}, { collection: 'time' });

const TimeModel = mongoose.model('Time', TimeSchema);

module.exports = TimeModel;
