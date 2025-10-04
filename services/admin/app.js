const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const AuthService = require('../../shared/authService');

const app = express();
const PORT = process.env.PORT || 6000;

// Initialize Auth Service
const authService = new AuthService();

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Authentication Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    // Validate token with auth service
    const validationResult = await authService.validateToken(token);
    
    // Check if user is admin
    if (validationResult.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }
    
    req.user = validationResult.user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'Admin Panel Service',
    status: 'running',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Admin routes
app.get('/', (req, res) => {
  res.json({
    message: 'Admin Panel Service',
    version: '1.0.0',
    endpoints: {
      companies: '/api/admin/companies',
      applicants: '/api/admin/applicants',
      jobs: '/api/admin/jobs',
      users: '/api/admin/users'
    }
  });
});

// Protected admin routes
app.use('/api/admin', authMiddleware);

// Company management routes
app.get('/api/admin/companies', async (req, res) => {
  try {
    // This would typically fetch from company service
    res.json({
      message: 'Company management endpoint',
      data: []
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Applicant management routes
app.get('/api/admin/applicants', async (req, res) => {
  try {
    // This would typically fetch from applicant service
    res.json({
      message: 'Applicant management endpoint',
      data: []
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Job management routes
app.get('/api/admin/jobs', async (req, res) => {
  try {
    // This would typically fetch from job service
    res.json({
      message: 'Job management endpoint',
      data: []
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// User management routes
app.get('/api/admin/users', async (req, res) => {
  try {
    // This would typically fetch from auth service
    res.json({
      message: 'User management endpoint',
      data: []
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong!'
  });
});

app.listen(PORT, () => {
  console.log(`Admin Panel Service running on port ${PORT}`);
});
