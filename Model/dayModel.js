const mongoose = require('mongoose');

const DaySchema = new mongoose.Schema({
    day_slot: [{
        day: { type: String, required: true },
        isAvailable: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now }
    }],
    
}, { collection: 'day' });

const DayModel = mongoose.model('Day', DaySchema);

module.exports = DayModel;
