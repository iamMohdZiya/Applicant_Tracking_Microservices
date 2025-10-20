module.exports = {
  // Database configuration
  dbUri: process.env.MONGO_URI || 'mongodb://user:password@localhost:27017/ats_auth',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key',
  
  // Service configuration
  port: process.env.PORT || 8000,
  
  // Service tokens for inter-service communication
  serviceTokens: {
    jobService: process.env.JOB_SERVICE_TOKEN || 'job_service_token_123',
    companyService: process.env.COMPANY_SERVICE_TOKEN || 'company_service_token_123',
    applicantService: process.env.APPLICANT_SERVICE_TOKEN || 'applicant_service_token_123'
  },
  
  // Kafka configuration
  kafkaBrokers: process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092']
};
