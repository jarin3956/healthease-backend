const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
    doc_id: { type: String, required: true },
    Day: { type:Array ,required: true},
    Time: { type:Array ,required: true}

}, { collection: 'schedule' });

const ScheduleModel = mongoose.model('Schedule', ScheduleSchema);

module.exports = ScheduleModel;
