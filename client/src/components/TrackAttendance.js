import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TrackAttendance.css'; // Create a CSS file for styling the table

const TrackAttendance = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_LINK}/api/attendance/track-attendance`);
                setAttendanceData(response.data); // Assuming the response is an array of attendance records
            } catch (error) {
                setError('Error fetching attendance data: ' + (error.response?.data || error.message));
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceData();
    }, []);

    const getMealAndStatus = (time) => {
        const mealTime = new Date(`1970-01-01T${time}:00Z`);
        const breakfastStart = new Date('1970-01-01T07:30:00Z');
        const breakfastEnd = new Date('1970-01-01T09:30:00Z');
        const lunchStart = new Date('1970-01-01T12:00:00Z');
        const lunchEnd = new Date('1970-01-01T14:00:00Z');
        const snacksStart = new Date('1970-01-01T17:00:00Z');
        const snacksEnd = new Date('1970-01-01T18:00:00Z');
        const dinnerStart = new Date('1970-01-01T19:30:00Z');
        const dinnerEnd = new Date('1970-01-01T21:30:00Z');

        let meal = '';
        let breakfastStatus = 'A', lunchStatus = 'A', snacksStatus = 'A', dinnerStatus = 'A';

        if (mealTime >= breakfastStart && mealTime <= breakfastEnd) {
            meal = 'Breakfast';
            breakfastStatus = 'P';
        } else if (mealTime >= lunchStart && mealTime <= lunchEnd) {
            meal = 'Lunch';
            lunchStatus = 'P';
        } else if (mealTime >= snacksStart && mealTime <= snacksEnd) {
            meal = 'Snacks';
            snacksStatus = 'P';
        } else if (mealTime >= dinnerStart && mealTime <= dinnerEnd) {
            meal = 'Dinner';
            dinnerStatus = 'P';
        }

        return { meal, breakfastStatus, lunchStatus, snacksStatus, dinnerStatus };
    };

    const groupByDate = (data) => {
        return data.reduce((acc, curr) => {
            const date = new Date(curr.time).toLocaleDateString();
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(curr);
            return acc;
        }, {});
    };

    const groupedData = groupByDate(attendanceData);

    return (
        <div>
            <h1>Track Attendance</h1>
            {loading && <p>Loading attendance data...</p>}
            {error && <p>{error}</p>}
            {Object.keys(groupedData).map((date) => (
                <div key={date}>
                    <h2>{date}</h2>
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
                            {groupedData[date].map((record) => {
                                const { uniqueId, rollNo, time } = record;
                                const { meal, breakfastStatus, lunchStatus, snacksStatus, dinnerStatus } = getMealAndStatus(time);
                                return (
                                    <tr key={uniqueId}>
                                        <td>{uniqueId}</td>
                                        <td>{rollNo}</td>
                                        <td>{time}</td>
                                        <td>{meal}</td>
                                        <td>{breakfastStatus}</td>
                                        <td>{lunchStatus}</td>
                                        <td>{snacksStatus}</td>
                                        <td>{dinnerStatus}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
};

export default TrackAttendance;
