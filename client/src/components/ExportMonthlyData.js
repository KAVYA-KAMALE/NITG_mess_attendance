import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import './ExportMonthlyData.css';

const ExportMonthlyData = () => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [studentDetails, setStudentDetails] = useState({});
    const [error, setError] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [filteredDates, setFilteredDates] = useState([]);

    // Fetch attendance records from the API
    const fetchAttendanceRecords = async () => {
        try {
            const trackAttendanceEndpoint = `${process.env.REACT_APP_LINK}/api/attendance/track-attendance`;
            const response = await axios.get(trackAttendanceEndpoint);
            setAttendanceRecords(response.data);
            fetchStudentDetails(response.data); 
        } catch (error) {
            setError('Error fetching attendance records');
        }
    };

    const fetchStudentDetails = async (records) => {
        const uniqueIds = [...new Set(records.map(record => record.uniqueId))];
        try {
            const responses = await Promise.all(
                uniqueIds.map(id => axios.get(`${process.env.REACT_APP_LINK}/api/students/details/${id}`))
            );
            const details = {};
            responses.forEach(response => {
                details[response.data.uniqueId] = response.data;
            });
            setStudentDetails(details);
        } catch (error) {
            setError('Error fetching student details');
        }
    };

    useEffect(() => {
        fetchAttendanceRecords();
    }, []);

    const groupByStudent = (records) => {
        return records.reduce((groups, record) => {
            const key = record.uniqueId;
            if (!groups[key]) {
                groups[key] = {};
            }
            const date = new Date(record.date).toLocaleDateString();
            groups[key][date] = {
                breakfastStatus: getMealStatus(records, record, 'Breakfast'),
                lunchStatus: getMealStatus(records, record, 'Lunch'),
                snacksStatus: getMealStatus(records, record, 'Snacks'),
                dinnerStatus: getMealStatus(records, record, 'Dinner'),
            };
            return groups;
        }, {});
    };

    const getUniqueDates = (records) => {
        const uniqueDates = Array.from(
            new Set(records.map(record => new Date(record.date).toLocaleDateString()))
        );
        return uniqueDates.sort((a, b) => new Date(a) - new Date(b));
    };

    const handleSearch = () => {
        if (!fromDate || !toDate) {
            setError('Please select both "from" and "to" dates.');
            return;
        }
        const from = new Date(fromDate);
        const to = new Date(toDate);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        const filtered = getUniqueDates(attendanceRecords).filter(date => {
            const currentDate = new Date(date);
            return currentDate >= from && currentDate <= to;
        });
        setFilteredDates(filtered);
        setError('');
    };

    const getMealType = (time) => {
        const timeParts = time.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)/i);
        if (!timeParts) return 'No Meal';
        let hours = parseInt(timeParts[1], 10);
        const minutes = parseInt(timeParts[2], 10);
        const period = timeParts[4].toUpperCase();
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        const totalMinutes = hours * 60 + minutes;
        if (totalMinutes >= 450 && totalMinutes < 570) return 'Breakfast';
        if (totalMinutes >= 720 && totalMinutes < 840) return 'Lunch';
        if (totalMinutes >= 1020 && totalMinutes < 1080) return 'Snacks';
        if (totalMinutes >= 1170 && totalMinutes < 1260) return 'Dinner';
        return 'No Meal';
    };

    const getMealStatus = (records, record, mealType) => {
        const date = new Date(record.date).toLocaleDateString();
        const currentMealType = getMealType(record.time);

        const previousRecords = records.filter(
            (r) => new Date(r.date).toLocaleDateString() === date && r.uniqueId === record.uniqueId
        );

        let breakfastStatus = 'A';
        let lunchStatus = 'A';
        let snacksStatus = 'A';
        let dinnerStatus = 'A';

        previousRecords.forEach((prevRecord) => {
            if (getMealType(prevRecord.time) === 'Breakfast') {
                breakfastStatus = 'P';
            }
            if (getMealType(prevRecord.time) === 'Lunch') {
                lunchStatus = 'P';
            }
            if (getMealType(prevRecord.time) === 'Snacks') {
                snacksStatus = 'P';
            }
            if (getMealType(prevRecord.time) === 'Dinner') {
                dinnerStatus = 'P';
            }
        });

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
                return 'A';
        }
    };

    const studentRecords = groupByStudent(attendanceRecords);

    const downloadExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Monthly Attendance');

        const headerRow = ['Roll No', 'Name', 'Semester', 'Fee Paid'];
        filteredDates.forEach(date => {
            headerRow.push(`${date} Breakfast`, `${date} Lunch`, `${date} Snacks`, `${date} Dinner`);
        });
        worksheet.addRow(headerRow);

        Object.keys(studentRecords).forEach(studentId => {
            const student = studentDetails[studentId] || {};
            const row = [
                student.rollNo || 'N/A',
                student.name || 'N/A',
                student.semester || 'N/A',
                student.feePaid || 'N/A',
            ];

            filteredDates.forEach(date => {
                row.push(
                    studentRecords[studentId][date]?.breakfastStatus || 'A',
                    studentRecords[studentId][date]?.lunchStatus || 'A',
                    studentRecords[studentId][date]?.snacksStatus || 'A',
                    studentRecords[studentId][date]?.dinnerStatus || 'A'
                );
            });

            worksheet.addRow(row);
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'MonthlyAttendance.xlsx');
    };

    return (
        <div className="export-monthly-data-container">
            <h2>Export Monthly Data</h2>
            {error && <p className="error-message">{error}</p>}

            <div className="date-filter-container">
                <label htmlFor="fromDate">From:</label>
                <input 
                    type="date" 
                    id="fromDate" 
                    value={fromDate} 
                    onChange={(e) => setFromDate(e.target.value)} 
                />
                <label htmlFor="toDate">To:</label>
                <input 
                    type="date" 
                    id="toDate" 
                    value={toDate} 
                    onChange={(e) => setToDate(e.target.value)} 
                />
                <button onClick={handleSearch}>Search</button>
            </div>

            <table className="monthly-attendance-table">
                <thead>
                    <tr>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Semester</th>
                        <th>Fee Paid</th>
                        {filteredDates.map(date => (
                            <th key={date} colSpan="4">{date}</th>
                        ))}
                    </tr>
                    <tr>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        {filteredDates.map(date => (
                            <>
                                <th key={`${date}-breakfast`}>Breakfast</th>
                                <th key={`${date}-lunch`}>Lunch</th>
                                <th key={`${date}-snacks`}>Snacks</th>
                                <th key={`${date}-dinner`}>Dinner</th>
                            </>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(studentRecords).map(studentId => (
                        <tr key={studentId}>
                            <td>{studentDetails[studentId]?.rollNo || 'N/A'}</td>
                            <td>{studentDetails[studentId]?.name || 'N/A'}</td>
                            <td>{studentDetails[studentId]?.semester || 'N/A'}</td>
                            <td>{studentDetails[studentId]?.feePaid || 'N/A'}</td>
                            {filteredDates.map(date => (
                                <>
                                    <td>{studentRecords[studentId][date]?.breakfastStatus || 'A'}</td>
                                    <td>{studentRecords[studentId][date]?.lunchStatus || 'A'}</td>
                                    <td>{studentRecords[studentId][date]?.snacksStatus || 'A'}</td>
                                    <td>{studentRecords[studentId][date]?.dinnerStatus || 'A'}</td>
                                </>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            <button onClick={downloadExcel} className="download-button">Download Excel</button>
        </div>
    );
};

export default ExportMonthlyData;
