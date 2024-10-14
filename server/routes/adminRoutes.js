const express = require('express');
const router = express.Router();
const Student = require('../models/Student'); // Assuming you have this model
const Attendance = require('../models/Attendance'); // Assuming you have this model
const verifyToken = require('../middleware/verifyToken'); // Import the token verification middleware

// Admin Dashboard route
router.get('/dashboard', verifyToken, (req, res) => {
    res.json({ message: 'Welcome to the admin dashboard' });
});

// Register student route
router.get('/register-student', verifyToken, (req, res) => {
    res.json({ message: 'Register student page' });
});

// Student details route
router.get('/student-details', verifyToken, (req, res) => {
    res.json({ message: 'Student details page' });
});

// Mess Attendance route
router.get('/mess-attendance', verifyToken, (req, res) => {
    res.json({ message: 'Mess Attendance page' });
});

module.exports = router;

