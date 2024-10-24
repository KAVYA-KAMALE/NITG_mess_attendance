import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TrackAttendance.css'; // Add CSS styling

const TrackAttendance = () => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState(''); // State for search input
    const [searchColumn, setSearchColumn] = useState('uniqueId'); // State for chosen column
    const [selectedDate, setSelectedDate] = useState(''); // State for date selection

    // Fetch attendance records from the API
    const fetchAttendanceRecords = async () => {
        try {
            const trackAttendanceEndpoint = `${process.env.REACT_APP_LINK}/api/attendance/track-attendance`;
            const response = await axios.get(trackAttendanceEndpoint);

            // Fetch student details for each attendance record
            const attendanceWithDetails = await Promise.all(response.data.map(async (record) => {
                const studentDetailsEndpoint = `${process.env.REACT_APP_LINK}/api/students/details/${record.uniqueId}`;
                const studentResponse = await axios.get(studentDetailsEndpoint);
                return { ...record, ...studentResponse.data };  // Merge student details into the record
            }));

            setAttendanceRecords(attendanceWithDetails);
        } catch (error) {
            setError('Error fetching attendance records');
        }
    };

    useEffect(() => {
        fetchAttendanceRecords();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        let query = searchQuery;

        if (searchColumn === 'date' && selectedDate) {
            query = selectedDate;
        }

        if (query.trim()) {
            const filteredRecords = attendanceRecords.filter(record => {
                switch (searchColumn) {
                    case 'uniqueId':
                        return record.uniqueId && record.uniqueId.includes(query);
                    case 'rollNo':
                        return record.rollNo && record.rollNo.includes(query);
                    case 'name': // Search by name
                        return record.name && record.name.toLowerCase().includes(query.toLowerCase());
                    case 'semester': // Search by semester
                        return record.semester && record.semester.toString() === query;
                    case 'feePaid': // Search by feePaid
                        return record.feePaid && record.feePaid.toString() === query;
                    case 'date':
                        const inputDate = new Date(query).toLocaleDateString();
                        const recordDate = new Date(record.date).toLocaleDateString();
                        return recordDate === inputDate;
                    case 'meal':
                        const mealType = getMealType(record.time);
                        return mealType && mealType.toLowerCase().includes(query.toLowerCase());
                    default:
                        return true;
                }
            });
            setAttendanceRecords(filteredRecords);
        } else {
            fetchAttendanceRecords();
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSelectedDate('');
        fetchAttendanceRecords();
    };

    const downloadExcel = () => {
        const exportAttendanceEndpoint = `${process.env.REACT_APP_LINK}/api/attendance/export-attendance`;
        window.open(exportAttendanceEndpoint);
    };

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

    const getMealType = (time) => {
        const timeParts = time.match(/(\d{1,2}):(\d{2}):\d{2} (\w{2})/);
        if (!timeParts) return 'No Meal';

        let hours = parseInt(timeParts[1]);
        const minutes = parseInt(timeParts[2]);
        const period = timeParts[3]; 

        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        const totalMinutes = (hours * 60) + minutes;

        if (totalMinutes >= 450 && totalMinutes < 570) {
            return 'Breakfast';
        } else if (totalMinutes >= 720 && totalMinutes < 840) {
            return 'Lunch';
        } else if (totalMinutes >= 1020 && totalMinutes < 1080) {
            return 'Snacks';
        } else if (totalMinutes >= 1170 && totalMinutes < 1260) {
            return 'Dinner';
        } else {
            return 'No Meal';
        }
    };

    const getMealStatus = (record, mealType) => {
        const currentMealType = getMealType(record.time);

        let breakfastStatus = record.breakfastStatus || 'A'; 
        let lunchStatus = record.lunchStatus || 'A'; 
        let snacksStatus = record.snacksStatus || 'A'; 
        let dinnerStatus = record.dinnerStatus || 'A'; 

        switch (mealType) {
            case 'Breakfast':
                return currentMealType === 'Breakfast' ? 'P' : breakfastStatus;
            case 'Lunch':
                return currentMealType === 'Lunch' ? 'P' : lunchStatus;
            case 'Snacks':
                return currentMealType === 'Snacks' ? 'P' : snacksStatus;
            case 'Dinner':
                return currentMealType === 'Dinner' ? 'P' : dinnerStatus;
            default:
                return 'No Meal';
        }
    };

    const groupedRecords = groupByDate(attendanceRecords);

    return (
        <div className="track-attendance-container">
            <h2>Track Attendance</h2>
            {error && <p>{error}</p>}

            <form onSubmit={handleSearch}>
                <div className="search-controls">
                    <select
                        value={searchColumn}
                        onChange={(e) => setSearchColumn(e.target.value)}
                        className="column-select"
                    >
                        <option value="uniqueId">Unique ID</option>
                        <option value="rollNo">Roll No</option>
                        <option value="name">Name</option>
                        <option value="semester">Semester</option>
                        <option value="feePaid">Fee Paid</option>
                        <option value="meal">Meal</option>
                        <option value="date">Date</option>
                    </select>

                    {searchColumn === 'date' ? (
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="search-input"
                        />
                    ) : (
                        <input
                            type="text"
                            placeholder={`Search by ${searchColumn}`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    )}

                    <button type="submit" className="search-button">Search</button>
                    <button type="button" className="back-button" onClick={handleClearSearch}>
                        Back
                    </button>
                </div>
            </form>

            {Object.keys(groupedRecords).length > 0 ? (
                Object.keys(groupedRecords).map(date => (
                    <div key={date} className="date-block">
                        <h3>{date}</h3>
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>Unique ID</th>
                                    <th>Roll No</th>
                                    <th>Name</th>
                                    <th>Semester</th>
                                    <th>Fee Paid</th>
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
                                        <td>{record.name}</td>
                                        <td>{record.semester}</td>
                                        <td>{record.feePaid}</td>
                                        <td>{record.time}</td>
                                        <td>{getMealType(record.time)}</td>
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

            <button onClick={downloadExcel} className="download-button">
                Download Attendance Data
            </button>
        </div>
    );
};

export default TrackAttendance;
