const express = require('express');
const bodyParser = require('body-parser');
const { Kafka } = require('kafkajs');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const companyRoutes = require('./routes/companyRoutes');
const AuthService = require('../../shared/authService');

// Kafka Configuration
const kafka = new Kafka({
  clientId: 'company-service',
  brokers: process.env.KAFKA_BROKERS.split(',')
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'company-service-group' });

// Initialize Auth Service
const authService = new AuthService();

// Initialize the Express application
const app = express();

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
    req.user = validationResult.user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }
};

// Database Connection
connectDB(process.env.MONGO_URI);

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Basic Health Check Route
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Company Microservice is running successfully.',
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Route Middleware with Authentication
app.use('/', authMiddleware, companyRoutes);

// Kafka Setup
const setupKafka = async () => {
  await producer.connect();
  await consumer.connect();
  
  // Subscribe to relevant topics
  await consumer.subscribe({ topics: ['company-events', 'job-events'] });
  
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const eventData = JSON.parse(message.value.toString());
      
      switch (eventData.type) {
        case 'COMPANY_UPDATED':
          console.log('Company profile updated:', eventData.payload);
          break;
        case 'JOB_CREATED':
          console.log('New job posted:', eventData.payload);
          break;
      }
    },
  });
};

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message 
    });
});

// Server Setup
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await setupKafka();
    app.listen(PORT, () => {
      console.log(`Company Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
