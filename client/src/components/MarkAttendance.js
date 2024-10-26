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
            const markAttendanceEndpoint = `${process.env.REACT_APP_LINK}/api/attendance/mark-attendance`;
            const response = await axios.post(markAttendanceEndpoint, { 
                uniqueId, 
                status: 'Present',
                date,
                time
            });
            setMessage(response.data);

            // Clear input field and set focus back to it for next input
            setUniqueId('');
            inputRef.current.focus(); // Refocus input field automatically
        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
            setMessage(error.response?.data || 'Error marking attendance');
        }
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
                autoFocus // Automatically focus on component load
            />
            <div className="button-group">
                <button type="submit">Mark Attendance</button>
            </div>
            {message && <p>{message}</p>}
        </form>
    );
};

export default MarkAttendance;
