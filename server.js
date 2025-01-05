const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

const path = require('path');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
const departmentRoutes = require('./routes/departments');
const employeeRoutes = require('./routes/employees');

app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);

// Default Route
app.get('/', (req, res) => {
  res.send('Employee Management System is running.');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Default Route
app.get('/', (req, res) => {
  res.send('Employee Management System is running.');
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
