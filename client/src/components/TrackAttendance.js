import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TrackAttendance.css'; // Add CSS styling

const TrackAttendance = () => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState(''); // State for search input
    const [searchColumn, setSearchColumn] = useState('uniqueId'); // State for chosen column
    const [selectedDate, setSelectedDate] = useState(''); // State for date selection

    // Fetch attendance records from the API using the environment variable for base URL
    const fetchAttendanceRecords = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_LINK}/api/attendance/track-attendance`);
            setAttendanceRecords(response.data);
        } catch (error) {
            setError('Error fetching attendance records');
        }
    };

    // Use useEffect to fetch attendance records on component mount
    useEffect(() => {
        fetchAttendanceRecords();
    }, []);

    // Handle search functionality
    const handleSearch = (e) => {
        e.preventDefault();
        let query = searchQuery;

        // Use selectedDate for date search
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
                    case 'date':
                        const inputDate = new Date(query).toLocaleDateString();  // Format as mm/dd/yyyy
                        const recordDate = new Date(record.date).toLocaleDateString();  // Format as mm/dd/yyyy
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
            fetchAttendanceRecords(); // Reset if search query is empty
        }
    };

    // Handle clearing the search (back button functionality)
    const handleClearSearch = () => {
        setSearchQuery('');
        setSelectedDate(''); // Clear selected date
        fetchAttendanceRecords(); // Refetch all records to reset the table
    };

    // Handle downloading the attendance records as an Excel file
    const downloadExcel = () => {
        window.open(`${process.env.REACT_APP_LINK}/api/attendance/export-attendance`);
    };

    // Group attendance records by date
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

    // Determine the meal based on the time
// Modify getMealType function to display time correctly based on the current timezone
const getMealType = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = (hours % 12) * 60 + minutes;

    if (totalMinutes >= 450 && totalMinutes < 570) { // Breakfast 7:30 AM to 9:30 AM
        return 'Breakfast';
    } else if (totalMinutes >= 720 && totalMinutes < 840) { // Lunch 12:00 PM to 2:00 PM
        return 'Lunch';
    } else if (totalMinutes >= 1020 && totalMinutes < 1080) { // Snacks 5:00 PM to 6:00 PM
        return 'Snacks';
    } else if (totalMinutes >= 1170 && totalMinutes < 1260) { // Dinner 7:30 PM to 9:00 PM
        return 'Dinner';
    } else {
        return 'No Meal';
    }
};

// Function to properly format the date/time
const formatDateTime = (dateString) => {
    const date = new Date(dateString);

    // Use Intl.DateTimeFormat to format the date/time to the local time zone
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    }).format(date);
};


    const groupedRecords = groupByDate(attendanceRecords);

    return (
        <div className="track-attendance-container">
            <h2>Track Attendance</h2>
            {error && <p>{error}</p>}

            {/* Search Form */}
            <form onSubmit={handleSearch}>
                <div className="search-controls">
                    <select
                        value={searchColumn}
                        onChange={(e) => setSearchColumn(e.target.value)}
                        className="column-select"
                    >
                        <option value="uniqueId">Unique ID</option>
                        <option value="rollNo">Roll No</option>
                        <option value="meal">Meal</option>
                        <option value="date">Date</option> {/* Include Date Option */}
                    </select>

                    {/* Conditionally render Date Picker or Text Input */}
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
                        <h3>{date}</h3> {/* Display date as a header */}
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>Unique ID</th>
                                    <th>Roll No</th>
                                    <th>Time</th>
                                    <th>Meal</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
    {groupedRecords[date].map(record => (
        <tr key={record._id}>
            <td>{record.uniqueId}</td>
            <td>{record.rollNo}</td>
            <td>{formatDateTime(record.time)}</td> {/* Use formatDateTime */}
            <td>{getMealType(record.time)}</td>
            <td>{record.status}</td>
        </tr>
    ))}
</tbody>
                        </table>
                    </div>
                ))
            ) : (
                <p>No attendance records found</p>
            )}

            <button onClick={downloadExcel} className="download-button">Download as Excel</button>
        </div>
    );
};

export default TrackAttendance;
