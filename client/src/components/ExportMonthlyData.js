import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ExportMonthlyData.css'; // Ensure proper CSS for styling

const ExportMonthlyData = () => {
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [error, setError] = useState('');

    // Fetch Student Details from API
    const fetchStudentDetails = async () => {
        try {
            const studentDetailsEndpoint = `${process.env.REACT_APP_LINK}/api/students/details`;
            const response = await axios.get(studentDetailsEndpoint);
            setStudents(response.data);
        } catch (err) {
            setError('Error fetching student details');
        }
    };

    // Fetch Attendance Records from API
    const fetchAttendanceRecords = async () => {
        try {
            const attendanceEndpoint = `${process.env.REACT_APP_LINK}/api/attendance/track-attendance`;
            const response = await axios.get(attendanceEndpoint);
            setAttendance(response.data);
        } catch (err) {
            setError('Error fetching attendance records');
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchStudentDetails();
        fetchAttendanceRecords();
    }, []);

    // Helper function to map meal statuses based on dates
    const getMealStatus = (record, mealType) => {
        switch (mealType) {
            case 'Breakfast':
                return record.breakfastStatus || 'A';
            case 'Lunch':
                return record.lunchStatus || 'A';
            case 'Snacks':
                return record.snacksStatus || 'A';
            case 'Dinner':
                return record.dinnerStatus || 'A';
            default:
                return 'A'; // Default to absent
        }
    };

    // Filter attendance records for each student by their Unique ID
    const getAttendanceForStudent = (studentId) => {
        return attendance.filter(record => record.uniqueId === studentId);
    };

    return (
        <div className="export-monthly-data-container">
            <h2>Export Monthly Data</h2>
            {error && <p className="error-message">{error}</p>}
            
            <table className="export-table">
                <thead>
                    <tr>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Semester</th>
                        <th>Fee Paid</th>
                        <th>Dates</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(student => (
                        <tr key={student.uniqueId}>
                            <td>{student.rollNo}</td>
                            <td>{student.name}</td>
                            <td>{student.semester}</td>
                            <td>{student.feePaid ? 'Yes' : 'No'}</td>
                            <td>
                                <table className="meal-status-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Breakfast</th>
                                            <th>Lunch</th>
                                            <th>Snacks</th>
                                            <th>Dinner</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getAttendanceForStudent(student.uniqueId).map(record => (
                                            <tr key={record.date}>
                                                <td>{new Date(record.date).toLocaleDateString()}</td>
                                                <td>{getMealStatus(record, 'Breakfast')}</td>
                                                <td>{getMealStatus(record, 'Lunch')}</td>
                                                <td>{getMealStatus(record, 'Snacks')}</td>
                                                <td>{getMealStatus(record, 'Dinner')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ExportMonthlyData;
