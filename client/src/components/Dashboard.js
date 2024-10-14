import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the token exists in localStorage
        const token = localStorage.getItem('authToken');
        if (!token) {
            // If no token, redirect to login page
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken'); // Remove token from local storage
        navigate('/login'); // Navigate back to the login page
    };

    return (
        <div className="dashboard-container">
            <h2>Admin Dashboard</h2>
            <div className="dashboard-links">
                <Link to="/register-student" className="dashboard-link">Register Student</Link>
                <Link to="/student-details" className="dashboard-link">Student Details</Link>
                <Link to="/mess-attendance" className="dashboard-link">Mess Attendance</Link>
            </div>
            <button onClick={handleLogout} className="logout-button">
                Logout
            </button>
        </div>
    );
};

export default Dashboard;
