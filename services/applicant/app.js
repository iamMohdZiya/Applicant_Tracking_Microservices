const express = require('express');
const bodyParser = require('body-parser');
const { Kafka } = require('kafkajs');
const jwt = require('jsonwebtoken');
const applicantRoutes = require('./routes/applicantRoutes');
const connectDB = require('./config/db');

// --- 1. Initialization ---
const app = express();
const PORT = process.env.PORT || 5000;

// --- 2. Kafka Configuration ---
const kafka = new Kafka({
  clientId: 'applicant-service',
  brokers: process.env.KAFKA_BROKERS.split(',')
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'applicant-service-group' });

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }
};

// --- 3. Database Connection ---
connectDB();

// --- 4. Middleware ---
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- 5. Health Check Route ---
app.get('/', (req, res) => {
    res.status(200).json({ 
        service: 'Applicant Profile Service', 
        status: 'Operational', 
        version: '1.0',
        timestamp: new Date().toISOString()
    });
});

// --- 6. Mount Routes with Authentication ---
app.use('/', authMiddleware, applicantRoutes);

// --- 7. Kafka Setup ---
const setupKafka = async () => {
  await producer.connect();
  await consumer.connect();
  
  // Subscribe to relevant topics
  await consumer.subscribe({ topics: ['applicant-events', 'job-events'] });
  
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const eventData = JSON.parse(message.value.toString());
      
      switch (eventData.type) {
        case 'APPLICATION_SUBMITTED':
          console.log('Application submitted:', eventData.payload);
          break;
        case 'JOB_UPDATED':
          console.log('Job posting updated:', eventData.payload);
          break;
      }
    },
  });
};

// --- 8. Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// --- 9. Start Server ---
const startServer = async () => {
  try {
    await setupKafka();
    app.listen(PORT, () => {
      console.log(`Applicant Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();