const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const Student = require('../models/Student');

// Create 'uploads' directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer to store uploaded files in the 'uploads' directory
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir); // Use the created uploads directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename
    }
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

// Register a new student (with photo upload)
router.post('/register', upload.single('photo'), async (req, res) => {
    const { uniqueId, name, rollNo, branch, semester, phoneNo, feePaid } = req.body;

    console.log('Received data:', req.body);

    // Get the file path of the uploaded photo
    const photoPath = req.file ? req.file.path.replace(/\\/g, '/') : null; // Use forward slashes

    try {
        const newStudent = new Student({
            uniqueId,
            name,
            rollNo,
            branch,
            semester,
            phoneNo,
            feePaid, 
            photo: photoPath // Store the relative path in the database
        });

        await newStudent.save();
        res.status(201).json({ message: 'Student registered successfully!', student: newStudent });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error registering student' });
    }
});

// Unregister a student (no photo needed)
router.post('/unregister', async (req, res) => {
    const { uniqueId } = req.body;

    try {
        await Student.findOneAndDelete({ uniqueId });
        res.status(200).json({ message: 'Student unregistered successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Error unregistering student' });
    }
});

// Update student details (no photo needed)
router.put('/update', async (req, res) => {
    const { uniqueId, name, rollNo, branch, semester, phoneNo, feePaid } = req.body;

    try {
        const updatedStudent = await Student.findOneAndUpdate(
            { uniqueId },
            { name, rollNo, branch, semester, phoneNo, feePaid },
            { new: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json(updatedStudent);
    } catch (err) {
        res.status(500).json({ error: 'Error updating student details' });
    }
});

// Get student details by uniqueId
router.get('/details/:uniqueId', async (req, res) => {
    const { uniqueId } = req.params;

    try {
        const student = await Student.findOne({ uniqueId });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json(student);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching student details' });
    }
});

module.exports = router;
