import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TrackAttendance.css';

const TrackAttendance = () => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState('');

    const fetchAttendanceRecords = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_LINK}/api/attendance/track-attendance`);
            setAttendanceRecords(response.data);
        } catch (error) {
            setError('Error fetching attendance records');
        }
    };

    useEffect(() => {
        fetchAttendanceRecords();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const filteredRecords = attendanceRecords.filter(record => record.uniqueId.includes(searchQuery));
            setAttendanceRecords(filteredRecords);
        } else {
            fetchAttendanceRecords();
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        fetchAttendanceRecords();
    };

    const getMealStatus = (record, mealType) => {
        switch (mealType) {
            case 'Breakfast':
                return record.breakfastStatus === 'P' ? 'P' : 'A';
            case 'Lunch':
                return record.lunchStatus === 'P' ? 'P' : 'A';
            case 'Snacks':
                return record.snacksStatus === 'P' ? 'P' : 'A';
            case 'Dinner':
                return record.dinnerStatus === 'P' ? 'P' : 'A';
            default:
                return 'A';
        }
    };

    const groupedRecords = attendanceRecords.reduce((groups, record) => {
        const date = new Date(record.date).toLocaleDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(record);
        return groups;
    }, {});

    return (
        <div className="track-attendance-container">
            <h2>Track Attendance</h2>
            {error && <p>{error}</p>}

            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search by Unique ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">Search</button>
                <button type="button" onClick={handleClearSearch}>Clear</button>
            </form>

            {Object.keys(groupedRecords).length > 0 ? (
                Object.keys(groupedRecords).map(date => (
                    <div key={date} className="date-block">
                        <h3>{date}</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Unique ID</th>
                                    <th>Roll No</th>
                                    <th>Time</th>
                                    <th>Meal</th>
                                    <th>Breakfast Status</th>
                                    <th>Lunch Status</th>
                                    <th>Snacks Status</th>
                                    <th>Dinner Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedRecords[date].map(record => (
                                    <tr key={record._id}>
                                        <td>{record.uniqueId}</td>
                                        <td>{record.rollNo}</td>
                                        <td>{record.time}</td>
                                        <td>{record.meal}</td>
                                        <td>{getMealStatus(record, 'Breakfast')}</td>
                                        <td>{getMealStatus(record, 'Lunch')}</td>
                                        <td>{getMealStatus(record, 'Snacks')}</td>
                                        <td>{getMealStatus(record, 'Dinner')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))
            ) : (
                <p>No attendance records found</p>
            )}
        </div>
    );
};

export default TrackAttendance;
