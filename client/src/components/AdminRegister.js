import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminRegister = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const endpoint = `${process.env.REACT_APP_LINK}/api/auth/register`;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            // Make a POST request to the backend to register the admin
            const res = await axios.post(endpoint, {
                username,
                password
            });
            console.log('Response:', res.data);
            setSuccess('Registration successful! Redirecting to login...');
            setError('');
            setTimeout(() => navigate('/login'), 2000); // Redirect after successful registration
        } catch (err) {
            console.error('Error:', err.response ? err.response.data : err.message);
            setError('Registration failed. Try again.');
        }
    };

    return (
        <div className="admin-register-container">
            <h2>Admin Registration</h2>
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
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="register-button">Register</button>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
            </form>
        </div>
    );
};

export default AdminRegister;
