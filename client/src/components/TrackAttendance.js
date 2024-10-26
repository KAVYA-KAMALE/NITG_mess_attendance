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
                        const recordDate = new Date(record.date).toLocaleDateString();  // Also format as mm/dd/yyyy

                        return recordDate === inputDate;  // Compare formatted dates
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
        const exportAttendanceEndpoint = `${process.env.REACT_APP_LINK}/api/attendance/export-attendance`;
        window.open(exportAttendanceEndpoint);
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
const getMealType = (time) => {
    // Update the regex to make seconds optional
    const timeParts = time.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)/i);
    if (!timeParts) {
        console.log(`Unexpected time format: ${time}`); // Log unexpected formats for debugging
        return 'No Meal';
    }

    let hours = parseInt(timeParts[1], 10);
    const minutes = parseInt(timeParts[2], 10);
    const period = timeParts[4].toUpperCase(); // AM or PM

    // Convert to 24-hour format
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const totalMinutes = (hours * 60) + minutes;

    // Meal time ranges in total minutes
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


    // Get Meal Status based on previous statuses and current meal
    const getMealStatus = (record, mealType) => {
        const currentMealType = getMealType(record.time);

        // Check for previous meal statuses
        let breakfastStatus = record.breakfastStatus || 'A'; // Default to A if not set
        let lunchStatus = record.lunchStatus || 'A'; // Default to A if not set
        let snacksStatus = record.snacksStatus || 'A'; // Default to A if not set
        let dinnerStatus = record.dinnerStatus || 'A'; // Default to A if not set

        switch (mealType) {
            case 'Breakfast':
                return currentMealType === 'Breakfast' ? 'P' : breakfastStatus; // 'P' if Breakfast, else keep previous status
            case 'Lunch':
                return currentMealType === 'Lunch' ? 'P' : lunchStatus;      // 'P' if Lunch, else keep previous status
            case 'Snacks':
                return currentMealType === 'Snacks' ? 'P' : snacksStatus;     // 'P' if Snacks, else keep previous status
            case 'Dinner':
                return currentMealType === 'Dinner' ? 'P' : dinnerStatus;     // 'P' if Dinner, else keep previous status
            default:
                return 'No Meal';
        }
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

            <button onClick={downloadExcel} className="download-button">Download as Excel</button>
        </div>
    );
};

export default TrackAttendance;
 
