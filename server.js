const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const path = require('path');

const app = express();

// Middleware to verify JWT
const authenticate = require('./middleware/auth');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
const departmentRoutes = require('./routes/departments');
const employeeRoutes = require('./routes/employees');
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const adminRoutes = require('./routes/admin');

const dashboardRoutes = require('./routes/dashboard');
const leaveRequestRoutes = require('./routes/leave-requests');

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);


app.use('/api/departments', departmentRoutes);
app.use('/api/employees', authenticate, employeeRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/leave-requests', authenticate, leaveRequestRoutes);

// 404 Handler
app.use((req, res, next) => {
    if (req.accepts('html')) {
        res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

// Global Error Handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Default Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect to MongoDB
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

  // Start the Server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
