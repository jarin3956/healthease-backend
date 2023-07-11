const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
    doc_id: { type: String, required: true },
    Day: {
        startTime: { type: Date },
        endTime: { type: Date },
        status: { type: Boolean },
    }

}, { collection: 'schedule' });

const ScheduleModel = mongoose.model('Schedule', ScheduleSchema);

module.exports = ScheduleModel;
