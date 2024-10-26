import React, { useState, useRef } from 'react';
import axios from 'axios';
import './MarkAttendance.css';

const MarkAttendance = ({ onAttendanceMarked }) => { // Add prop for callback
    const [uniqueId, setUniqueId] = useState('');
    const [message, setMessage] = useState('');
    const inputRef = useRef(null);

    const determineMealType = () => {
        const currentTime = new Date();
        const hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();

        if (hours >= 7 && hours < 9) return 'Breakfast';
        if (hours >= 12 && hours < 14) return 'Lunch';
        if (hours >= 17 && hours < 18) return 'Snacks';
        if (hours >= 19 && hours < 21) return 'Dinner';
        return 'No Meal';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!uniqueId.trim()) {
            setMessage('Please enter the Unique ID.');
            return;
        }

        const currentDateTime = new Date();
        const date = currentDateTime.toLocaleDateString();
        const time = currentDateTime.toLocaleTimeString();
        const mealType = determineMealType();

        try {
            const response = await axios.post(`${process.env.REACT_APP_LINK}/api/attendance/mark-attendance`, { 
                uniqueId, 
                status: 'Present',
                date,
                time,
                meal: mealType // Send meal type for specific attendance
            });

            setMessage(response.data);
            setUniqueId('');
            inputRef.current.focus();

            if (onAttendanceMarked) onAttendanceMarked(); // Trigger refresh in TrackAttendance

        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
            setMessage(error.response?.data || 'Error marking attendance');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                ref={inputRef}
                type="text"
                value={uniqueId}
                onChange={(e) => setUniqueId(e.target.value)}
                placeholder="Enter Unique ID"
                required
                autoFocus
            />
            <div className="button-group">
                <button type="submit">Mark Attendance</button>
            </div>
            {message && <p>{message}</p>}
        </form>
    );
};

export default MarkAttendance;
