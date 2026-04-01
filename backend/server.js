// ============================================================
// server.js — The main entry point of our backend application
// ============================================================
// Think of this file as the "front door" of the backend.
// It:
//   1. Creates an Express app (a web server)
//   2. Connects to MongoDB (our database)
//   3. Registers all our routes (URL endpoints)
//   4. Starts listening for requests on a port
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Loads variables from .env file

const app = express();

// --- MIDDLEWARE ---
// Middleware runs on EVERY request before it hits our routes.
// cors() allows the React frontend (on port 3000) to talk to this
//   backend (on port 5000). Without this, browsers block the request.
// express.json() parses incoming JSON bodies so we can read req.body
app.use(cors());
app.use(express.json());

// --- ROUTES ---
// Each route file handles a group of related URLs.
// e.g. /api/auth handles login and registration
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/masters',    require('./routes/masters'));
app.use('/api/applicants', require('./routes/applicants'));
app.use('/api/admissions', require('./routes/admissions'));

// --- GLOBAL ERROR HANDLER ---
// If any route throws an error, this catches it and sends a clean response.
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// --- DATABASE CONNECTION ---
// mongoose.connect() opens a connection to MongoDB.
// We only start the server AFTER the DB is connected (inside .then).
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1); // Stop the app if DB fails
  });
