const express = require('express');
const path = require('path');
require('dotenv').config();
require('./config/mongodbconn.cjs');

const instructorRoutes = require('./routes/instructorRoutes.cjs');
const packageRoutes = require('./routes/packageRoutes.cjs');
const customerRoutes = require('./routes/customerRoutes.cjs');
const classRoutes = require('./routes/classRoutes.cjs');
const attendanceRoutes = require('./routes/attendanceRoutes.cjs');

const app = express();
const PORT = process.env.PORT || 8080;

// No-cache for HTML in dev
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/' || req.path === '/index.html') {
    res.set('Cache-Control', 'no-store');
  }
  next();
});

// Static files (no caching)
app.use(express.static(path.join(__dirname, 'public'), { etag: false, lastModified: false, maxAge: 0 }));

// Remove any old: app.get('/', (req,res)=>res.send('Server is up and running.'))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// APIs
app.use(express.json());
app.use('/api/instructor', instructorRoutes);
app.use('/api/package', packageRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/class', classRoutes);
app.use('/api/attendance', attendanceRoutes);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
  console.log(`Open http://localhost:${PORT}/`);
});
