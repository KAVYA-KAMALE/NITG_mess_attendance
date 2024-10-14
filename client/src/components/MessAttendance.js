import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import navigation hook
import './MessAttendance.css'; // Import the CSS file for styling

const MessAttendance = () => {
    const navigate = useNavigate(); // Initialize the navigation hook

    return (
        <div className="mess-attendance-container">
            <h2>Mess Attendance</h2>

            <div className="attendance-options">
                <button 
                    className="attendance-button" 
                    onClick={() => navigate('/mess-attendance/mark')}
                >
                    Mark Attendance
                </button>
                
                <button 
                    className="attendance-button" 
                    onClick={() => navigate('/mess-attendance/track')}
                >
                    Track Attendance
                </button>
                
                <button 
                    className="attendance-button" 
                    onClick={() => navigate('/mess-attendance/export')}
                >
                    Export Monthly Data
                </button>

            </div>
        </div>
    );
};

export default MessAttendance;
