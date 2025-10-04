const express = require('express');
const bodyParser = require('body-parser');
const { Kafka } = require('kafkajs');
const jwt = require('jsonwebtoken');

// --- Configuration Imports ---
const connectDB = require('./config/db');
const jobRoutes = require('./routes/jobRoutes');
const AuthService = require('../../shared/authService');

// --- Environment Variables ---
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// --- Kafka Configuration ---
const kafka = new Kafka({
  clientId: 'job-service',
  brokers: process.env.KAFKA_BROKERS.split(',')
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'job-service-group' });

// Initialize Auth Service
const authService = new AuthService();

// --- Database Connection ---
connectDB(process.env.MONGO_URI);

// --- Initialize Express App ---
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

// --- Middleware ---
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// --- Root Health Check ---
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Job Posting Service is running smoothly!',
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// --- Route Mounting with Authentication ---
app.use('/', authMiddleware, jobRoutes);

// --- Kafka Setup ---
const setupKafka = async () => {
  await producer.connect();
  await consumer.connect();
  
  // Subscribe to relevant topics
  await consumer.subscribe({ topics: ['job-events', 'application-events'] });
  
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const eventData = JSON.parse(message.value.toString());
      
      switch (eventData.type) {
        case 'APPLICATION_SUBMITTED':
          // Handle new application event
          console.log('New application submitted:', eventData.payload);
          break;
        case 'JOB_STATUS_UPDATED':
          // Handle job status update
          console.log('Job status updated:', eventData.payload);
          break;
      }
    },
  });
};

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message 
    });
});

// --- Start Server ---
const startServer = async () => {
  try {
    await setupKafka();
    app.listen(PORT, () => {
      console.log(`Job Posting Service listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
