const express = require('express');
const { loginAdmin, registerAdmin } = require('../controllers/authController');
const router = express.Router();
const Admin = require('../models/Admin');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the admin already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin
        const newAdmin = new Admin({
            username,
            password: hashedPassword,
        });

        // Save to MongoDB
        await newAdmin.save();

        // Generate JWT token
        const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Return token
        res.status(201).json({ message: 'Admin registered successfully', token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login route
router.post('/login', loginAdmin);

module.exports = router;
