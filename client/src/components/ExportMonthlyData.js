import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ExportMonthlyData.css'; // Create appropriate CSS file for styling

const ExportMonthlyData = () => {
    const [students, setStudents] = useState([]); // Hold student details
    const [attendanceRecords, setAttendanceRecords] = useState([]); // Hold attendance data
    const [error, setError] = useState('');
    
    // Fetch student details from StudentDetails component
    const fetchStudentDetails = async () => {
        try {
            const studentDetailsEndpoint = `${process.env.REACT_APP_LINK}/api/students/details`;
            const response = await axios.get(studentDetailsEndpoint);
            setStudents(response.data); // Assuming API returns an array of student details
        } catch (err) {
            setError('Error fetching student details');
        }
    };

    // Fetch attendance records from TrackAttendance component
    const fetchAttendanceRecords = async () => {
        try {
            const attendanceEndpoint = `${process.env.REACT_APP_LINK}/api/attendance/track-attendance`;
            const response = await axios.get(attendanceEndpoint);
            setAttendanceRecords(response.data); // Assuming API returns attendance data
        } catch (err) {
            setError('Error fetching attendance records');
        }
    };

    // Use useEffect to fetch data on component mount
    useEffect(() => {
        fetchStudentDetails();
        fetchAttendanceRecords();
    }, []);

    // Helper to group attendance records by date and track meals
    const groupByDate = (records) => {
        return records.reduce((groups, record) => {
            const date = new Date(record.date).toLocaleDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(record);
            return groups;
        }, {});
    };

    const groupedAttendance = groupByDate(attendanceRecords);

    return (
        <div className="export-monthly-data-container">
            <h2>Export Monthly Data</h2>
            {error && <p className="error">{error}</p>}
            <table className="monthly-data-table">
                <thead>
                    <tr>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Semester</th>
                        <th>Fee Paid</th>
                        {/* Dynamically add date columns with sub-columns for meals */}
                        {Object.keys(groupedAttendance).map(date => (
                            <th key={date}>
                                {date}
                                <div className="meal-subcols">
                                    <span>Breakfast</span>
                                    <span>Lunch</span>
                                    <span>Snacks</span>
                                    <span>Dinner</span>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {/* Render each student's details */}
                    {students.map(student => (
                        <tr key={student.uniqueId}>
                            <td>{student.rollNo}</td>
                            <td>{student.name}</td>
                            <td>{student.semester}</td>
                            <td>{student.feePaid ? 'Yes' : 'No'}</td>
                            {/* For each student, render attendance status for each date */}
                            {Object.keys(groupedAttendance).map(date => {
                                const attendanceForDate = groupedAttendance[date].find(
                                    record => record.uniqueId === student.uniqueId
                                );
                                return (
                                    <td key={date}>
                                        <div className="meal-status">
                                            <span>{attendanceForDate?.breakfastStatus || 'A'}</span>
                                            <span>{attendanceForDate?.lunchStatus || 'A'}</span>
                                            <span>{attendanceForDate?.snacksStatus || 'A'}</span>
                                            <span>{attendanceForDate?.dinnerStatus || 'A'}</span>
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ExportMonthlyData;
