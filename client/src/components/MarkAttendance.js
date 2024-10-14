import React, { useState, useRef } from 'react';
import axios from 'axios';
import './MarkAttendance.css';

const MarkAttendance = () => {
    const [uniqueId, setUniqueId] = useState('');
    const [message, setMessage] = useState('');
    const inputRef = useRef(null); // Ref to manage focus on input field

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting:', { uniqueId });

        if (!uniqueId.trim()) {
            setMessage('Please enter the Unique ID.');
            return;
        }

        const currentDateTime = new Date();
        const date = currentDateTime.toLocaleDateString(); // Get date in DD/MM/YYYY format
        const time = currentDateTime.toLocaleTimeString(); // Get time in HH:MM:SS format

        try {
            // Send both date and time to the API
            const response = await axios.post('http://localhost:4000/api/attendance/mark-attendance', { 
                uniqueId, 
                status: 'Present',
                date,
                time
            });
            setMessage(response.data);
        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
            setMessage(error.response?.data || 'Error marking attendance');
        }
    };

    const handleReset = () => {
        setUniqueId(''); // Clear the input field
        setMessage('');  // Clear any message
        inputRef.current.focus(); // Set focus back to the input field
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                ref={inputRef} // Attach ref to input field
                type="text"
                value={uniqueId}
                onChange={(e) => setUniqueId(e.target.value)}
                placeholder="Enter Unique ID"
                required
            />
            <div className="button-group">
                <button type="submit">Mark Attendance</button>
                <button type="button" onClick={handleReset}>Reset</button> {/* Reset button */}
            </div>
            {message && <p>{message}</p>}
        </form>
    );
};

export default MarkAttendance;
