/**
 * Express server entry point.
 * Mounts API routes for staff, services, custom fields, reservations, and uploads.
 * Serves uploaded photos from /uploads; uses CORS and JSON body parsing.
 */
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const staffRoutes = require('./routes/staff');
const servicesRoutes = require('./routes/services');
const serviceFieldsRoutes = require('./routes/serviceFields');
const reservationsRoutes = require('./routes/reservations');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/staff', staffRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/service-fields', serviceFieldsRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/upload', uploadRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
