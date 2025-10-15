const express = require('express');
const path = require('path');
const mongoose = require('./config/mongodbconn.cjs');

const instructorRoutes = require('./routes/instructorRoutes.cjs');
const packageRoutes = require('./routes/packageRoutes.cjs');
const customerRoutes = require('./routes/customerRoutes.cjs');
const classRoutes = require('./routes/classRoutes.cjs');
const attendanceRoutes = require('./routes/attendanceRoutes.cjs');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/instructor', instructorRoutes);
app.use('/api/package', packageRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/class', classRoutes);
app.use('/api/attendance', attendanceRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
  console.log(`Visit http://localhost:${PORT}/index.html in your browser to view the app.`);
});
