const Student = require('../models/Student');

exports.registerStudent = async (req, res) => {
    const { uniqueId, name, rollNo, branch, semester, phoneNo, feePaid } = req.body;

    try {
        const newStudent = new Student({
            uniqueId,
            name,
            rollNo,
            branch,
            semester,
            phoneNo,
            feePaid,
        });

        await newStudent.save();
        res.status(201).json({ message: 'Student registered successfully!' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error registering student' });
    }
};

// Unregister, update, and getStudentDetails methods go here (as provided).
