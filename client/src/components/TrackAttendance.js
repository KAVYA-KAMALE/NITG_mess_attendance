import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import './TrackAttendance.css';

const TrackAttendance = () => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchColumn, setSearchColumn] = useState('uniqueId');
    const [selectedDate, setSelectedDate] = useState('');

    const fetchAttendanceRecords = async () => {
        try {
            const trackAttendanceEndpoint = `${process.env.REACT_APP_LINK}/api/attendance/track-attendance`;
            const response = await axios.get(trackAttendanceEndpoint);
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
        console.log("Meal Time: ", time); // Log the time
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

    const convertUTCToIST = (utcTime) => {
        const date = new Date(utcTime);
        if (isNaN(date)) return 'Invalid Time'; // Handle invalid date
        const istOffset = 5 * 60 + 30; // IST offset
        const istTime = new Date(date.getTime() + istOffset * 60 * 1000);
        return istTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
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
                                        <td>
                                            {record.time ? convertUTCToIST(record.time) : 'Invalid Time'}
                                        </td> {/* Convert UTC to IST */}
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
                <p>No records found for the selected criteria.</p>
            )}

            <button onClick={downloadExcel} className="download-button">Download Attendance</button>
        </div>
    );
};

export default TrackAttendance;
