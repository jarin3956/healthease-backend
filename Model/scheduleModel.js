const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
    doc_id: { type: String, required: true },
    schedule: [{
        day: { type: String, required: true },
        time: [
            {
                timeslot: { type: String, required: true },
                isAvailable: { type: Boolean, default: true }
            }
        ]
    }],
    createdAt: { type: Date, default: Date.now }
}, { collection: 'schedule' });

const ScheduleModel = mongoose.model('Schedule', ScheduleSchema);

module.exports = ScheduleModel;
