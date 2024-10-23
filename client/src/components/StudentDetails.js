import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './StudentDetails.css'; // Ensure this CSS file exists

const StudentDetails = () => {
    const [uniqueId, setUniqueId] = useState('');
    const [student, setStudent] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // New loading state
    const inputRef = useRef(null);
    const [isCardScan, setIsCardScan] = useState(false);
    const lastInputTime = useRef(Date.now());

    // Function to handle fetching student details
    const fetchStudentDetails = async (id) => {
        setLoading(true);
        try {
            const studentDetailsEndpoint = `${process.env.REACT_APP_LINK}/api/students/details/${id}`;
            const response = await axios.get(studentDetailsEndpoint);
            setStudent(response.data);
            setError('');
        } catch (err) {
            setStudent(null);
            setError('Student not found');
        } finally {
            setLoading(false);
        }
    };

    // Handle input change and detect card scan
    const handleInputChange = (e) => {
        const currentTime = Date.now();
        setUniqueId(e.target.value);

        // If input is filled within 300ms (simulate card scan)
        if (currentTime - lastInputTime.current < 300) {
            setIsCardScan(true);
        } else {
            setIsCardScan(false);
        }

        lastInputTime.current = currentTime;
    };

    // Auto-fetch details if a card is scanned
    useEffect(() => {
        if (uniqueId && isCardScan) {
            fetchStudentDetails(uniqueId);
        }
    }, [uniqueId, isCardScan]);

    // Handle Scan button click (manual input)
    const handleScan = () => {
        if (uniqueId.trim()) {
            fetchStudentDetails(uniqueId);
        } else {
            setError('Please enter a Unique ID.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setUniqueId('');
        setStudent(null);
        setError('');
        inputRef.current.focus();
    };

    return (
        <div className="student-details-container">
            <h2>Student Details</h2>
            <div className="form-group">
                <label htmlFor="uniqueId">Scan Unique ID</label>
                <input
                    type="text"
                    id="uniqueId"
                    placeholder="Enter Unique ID"
                    value={uniqueId}
                    onChange={handleInputChange}
                    ref={inputRef}
                />
                <div className="button-group">
                    <button onClick={handleScan} className="scan-button">Scan</button>
                    <button onClick={handleReset} className="reset-button">Reset</button>
                </div>
            </div>
            {loading && <p>Loading...</p>} {/* Show loading text */}
            {student && !loading && (
                <div className="student-info">
                    <h3>Student Details</h3>
                    <p><strong>Unique ID:</strong> {student.uniqueId}</p>
                    <p><strong>Name:</strong> {student.name}</p>
                    <p><strong>Roll No:</strong> {student.rollNo}</p>
                    <p><strong>Branch:</strong> {student.branch}</p>
                    <p><strong>Semester:</strong> {student.semester}</p>
                    <p><strong>Phone No:</strong> {student.phoneNo}</p>
                    <p><strong>Fee Paid:</strong> {student.feePaid}</p>
                </div>
            )}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default StudentDetails;
