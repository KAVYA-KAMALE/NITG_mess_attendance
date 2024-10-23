import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TrackAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);

  // Fetch attendance data (this will run once when the component mounts)
  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  // Fetch attendance records from API
  const fetchAttendanceRecords = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_LINK}/api/attendance/track-attendance`);
      setAttendanceData(response.data);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
    }
  };

  // Function to determine the current meal based on time
  const determineMeal = (time) => {
    const hours = new Date(time).getHours();
    if (hours >= 7 && hours <= 9) return 'Breakfast';
    else if (hours >= 12 && hours <= 14) return 'Lunch';
    else if (hours >= 17 && hours <= 18) return 'Snacks';
    else if (hours >= 19 && hours <= 21) return 'Dinner';
    return '-';  // Default case
  };

  // Render Table
  return (
    <div>
      <h2>Track Attendance</h2>
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
          {attendanceData.map((record, index) => {
            const meal = determineMeal(record.time);  // Determine meal based on time
            return (
              <tr key={index}>
                <td>{record.uniqueId}</td>
                <td>{record.rollNo}</td>
                <td>{new Date(record.time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                <td>{meal}</td>
                <td>{meal === 'Breakfast' ? 'P' : 'A'}</td>
                <td>{meal === 'Lunch' ? 'P' : 'A'}</td>
                <td>{meal === 'Snacks' ? 'P' : 'A'}</td>
                <td>{meal === 'Dinner' ? 'P' : 'A'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TrackAttendance;
