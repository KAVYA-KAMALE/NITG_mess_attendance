const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true },
  name: { type: String, required: true },
  rollNo: { type: String, required: true },
  status: { type: String, required: true },
  time: { type: String, required: true },
  date: { type: Date, default: Date.now } // Store the date attendance was marked
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
