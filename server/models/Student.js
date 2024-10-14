const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    uniqueId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    rollNo: { type: String, required: true },
    branch: { type: String, required: true },
    semester: { type: String, required: true },
    phoneNo: { type: String, required: true },
    feePaid: { type: String, required: true },
    photo: {type: String, required: true}
});

module.exports = mongoose.model('Student', studentSchema);

