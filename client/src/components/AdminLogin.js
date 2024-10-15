import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const endpoint = `${process.env.REACT_APP_LINK}/api/auth/login`;

    useEffect(() => {
        // Redirect to dashboard if token is already present (meaning user is logged in)
        if (localStorage.getItem('authToken')) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(endpoint, {
                username,
                password
            });
            console.log('Response:', res.data); // Add this for debugging
            localStorage.setItem('authToken', res.data.token);
            setSuccess('Login successful! Redirecting...');
            setError('');
            window.location.href = '/dashboard';
        } catch (err) {
            console.error('Error:', err.response ? err.response.data : err.message); // Add this for debugging
            setError('Invalid username or password');
            setSuccess('');
        }
    };

    // Redirect to registration page
    const handleRegisterRedirect = () => {
        navigate('/register');
    };

    return (
        <div className="admin-login-container">
            <h2>Admin Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="login-button">Login</button>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
            </form>
            <p>Don't have an account? <button onClick={handleRegisterRedirect} className="register-button">Register here</button></p>
        </div>
    );
};

export default AdminLogin;
