const express = require('express');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const excel = require('exceljs'); // Add exceljs for Excel export
const moment = require('moment'); // For date manipulation
const router = express.Router();

// Route to mark attendance
router.post('/mark-attendance', async (req, res) => {
  const { uniqueId, status } = req.body;

  console.log("Received data:", req.body); // Log the request body for debugging

  if (!uniqueId || !status) {
    return res.status(400).send('Unique ID and status are required');
  }

  try {
    // Find student by unique ID in the students collection
    const student = await Student.findOne({ uniqueId: uniqueId });

    if (!student) {
      return res.status(404).send('Student not found');
    }

    // Get the current time in IST (Indian Standard Time)
    const currentTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(new Date());

    // Create new attendance record with student details and time
    const attendance = new Attendance({
      uniqueId: student.uniqueId,
      name: student.name,
      rollNo: student.rollNo,
      status,
      time: currentTime // Save the time in IST format
    });

    await attendance.save();
    res.status(201).send('Attendance marked successfully');
  } catch (error) {
    res.status(500).send('Error marking attendance: ' + error.message);
  }
});

// Route to get all attendance records
router.get('/track-attendance', async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find();
    res.status(200).json(attendanceRecords); // Return all attendance records, including time
  } catch (error) {
    res.status(500).send('Error fetching attendance records: ' + error.message);
  }
});

// Route to export attendance data as an Excel file
router.get('/export-attendance', async (req, res) => {
  try {
      // Fetch attendance data from the database
      const attendanceRecords = await Attendance.find();

      // Create a new Excel workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Attendance Records');

      // Define columns in the worksheet
      worksheet.columns = [
          { header: 'Unique ID', key: 'uniqueId', width: 15 },
          { header: 'Roll No', key: 'rollNo', width: 15 },
          { header: 'Date', key: 'date', width: 15 },
          { header: 'Time', key: 'time', width: 15 },
          { header: 'Meal Type', key: 'mealType', width: 15 },
          { header: 'Breakfast Status', key: 'breakfastStatus', width: 20 },
          { header: 'Lunch Status', key: 'lunchStatus', width: 20 },
          { header: 'Snacks Status', key: 'snacksStatus', width: 20 },
          { header: 'Dinner Status', key: 'dinnerStatus', width: 20 },
      ];

      // Helper function to determine meal type from time

     const getMealType = (time) => {
          const timeParts = time.match(/(\d{1,2}):(\d{2}):\d{2} (\w{2})/);
          if (!timeParts) return 'No Meal';

          let hours = parseInt(timeParts[1]);
          const minutes = parseInt(timeParts[2]);
          const period = timeParts[3]; // AM or PM

          if (period === 'PM' && hours < 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;

          const totalMinutes = (hours * 60) + minutes;

          if (totalMinutes >= 450 && totalMinutes < 570) return 'Breakfast'; // 7:30 AM to 9:30 AM
          if (totalMinutes >= 720 && totalMinutes < 840) return 'Lunch';     // 12:00 PM to 2:00 PM
          if (totalMinutes >= 1020 && totalMinutes < 1080) return 'Snacks';  // 5:00 PM to 6:00 PM
          if (totalMinutes >= 1170 && totalMinutes < 1260) return 'Dinner';  // 7:30 PM to 9:00 PM
          return 'No Meal';
      };

      // Add rows to the worksheet from attendance records
    // Add rows to the worksheet from attendance records
attendanceRecords.forEach(record => {
    const mealType = getMealType(record.time);
    
    // Initialize statuses to 'A' (Absent)
    let breakfastStatus = 'A';
    let lunchStatus = 'A';
    let snacksStatus = 'A';
    let dinnerStatus = 'A';
    
    // Update the status based on the meal type
    if (mealType === 'Breakfast') {
        breakfastStatus = 'P'; // Present
    } else if (mealType === 'Lunch') {
        lunchStatus = 'P'; // Present
    } else if (mealType === 'Snacks') {
        snacksStatus = 'P'; // Present
    } else if (mealType === 'Dinner') {
        dinnerStatus = 'P'; // Present
    }

    worksheet.addRow({
        uniqueId: record.uniqueId,
        rollNo: record.rollNo,
        date: new Date(record.date).toLocaleDateString(),
        time: record.time,
        mealType: mealType,
        breakfastStatus: breakfastStatus,
        lunchStatus: lunchStatus,
        snacksStatus: snacksStatus,
        dinnerStatus: dinnerStatus,
    });
});


      // Set the response headers to force a download
      res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
          'Content-Disposition',
          'attachment; filename=' + 'attendance_records.xlsx'
      );

      // Write the Excel file to the response
      await workbook.xlsx.write(res);
      res.status(200).end();
  } catch (error) {
      console.error('Error exporting attendance data:', error);
      res.status(500).json({ error: 'Failed to export attendance data' });
  }
});



module.exports = router;
