const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const os = require('os');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({
    origin:'*'
}));
app.use(express.json());

app.get("/",(req,res)=>{
    res.status(200).json({"Server Status":"Running"});
})

// Serve static files from the uploads directory
const uploadsDir = path.join(os.tmpdir(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use(express.static("uploads"));
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);

const PORT = process.env.PORT || 4000;
connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("ERR: ",error);
        throw error
    })
    app.listen(PORT,()=>{
        console.log(`Server running on port ${PORT}`);
    })
})
.catch((err)=>{
    console.log("MongoDB connection error !!! ",err);
})

