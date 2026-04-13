const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const connectDB = require('./src/utils/database');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('backend/uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'StudyMate API is running' });
});

// API routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/materials', require('./src/routes/materialRoutes'));
app.use('/api/upload', require('./src/routes/uploadRoutes'));
app.use('/api/wellness', require('./src/routes/wellnessRoutes'));
app.use('/api/progress', require('./src/routes/progressRoutes'));

// Error handling middleware
app.use(require('./src/middleware/errorHandler'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`StudyMate server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});