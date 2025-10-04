# ATS (Applicant Tracking System) - Microservices Architecture

A comprehensive microservices-based Applicant Tracking System built with Node.js, Express, MongoDB, and Kafka.

## 🏗️ Architecture Overview

This system consists of 5 microservices:

1. **Auth Service** (Port 8000) - User authentication and authorization
2. **Company Service** (Port 4000) - Company profile management
3. **Job Service** (Port 3000) - Job posting and management
4. **Applicant Service** (Port 5000) - Applicant profile and application management
5. **Admin Service** (Port 6000) - Administrative panel for system management

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### Running the System

1. **Clone and navigate to the project:**
   ```bash
   cd ats
   ```

2. **Start all services with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Access the system:**
   - API Gateway: http://localhost
   - Auth Service: http://localhost:8000
   - Company Service: http://localhost:4000
   - Job Service: http://localhost:3000
   - Applicant Service: http://localhost:5000
   - Admin Service: http://localhost:6000

## 📋 API Endpoints

### Authentication Service (`/api/auth/`)
- `POST /register` - Register a new user
- `POST /login` - User login
- `POST /validate` - Validate access token
- `POST /refresh` - Refresh access token
- `POST /validate-service` - Validate service token

### Company Service (`/api/companies/`)
- `GET /` - Get all companies
- `GET /:id` - Get company by ID
- `POST /` - Create new company (requires auth)
- `PUT /:id` - Update company (requires auth)
- `DELETE /:id` - Delete company (requires auth)

### Job Service (`/api/jobs/`)
- `GET /` - Get all jobs
- `GET /:id` - Get job by ID
- `POST /` - Create new job (requires auth)
- `PUT /:id` - Update job (requires auth)
- `DELETE /:id` - Delete job (requires auth)

### Applicant Service (`/api/applicants/`)
- `GET /` - Get all applicants
- `GET /:id` - Get applicant by ID
- `POST /` - Create new applicant (requires auth)
- `PUT /:id` - Update applicant (requires auth)
- `DELETE /:id` - Delete applicant (requires auth)

### Admin Service (`/api/admin/`)
- `GET /companies` - Manage companies (admin only)
- `GET /applicants` - Manage applicants (admin only)
- `GET /jobs` - Manage jobs (admin only)
- `GET /users` - Manage users (admin only)

## 🔐 Authentication Flow

1. **User Registration/Login:**
   - Users register/login through the Auth Service
   - Auth Service returns JWT access and refresh tokens

2. **Service-to-Service Authentication:**
   - Other services validate tokens with the Auth Service
   - Each service has its own service token for inter-service communication

3. **Role-Based Access:**
   - `applicant` - Can apply for jobs and manage profile
   - `company` - Can post jobs and manage company profile
   - `admin` - Can manage all entities in the system

## 🗄️ Database Structure

Each service has its own MongoDB database:
- `ats_auth` - User authentication data
- `ats_companies` - Company profiles
- `ats_jobs` - Job postings
- `ats_applicants` - Applicant profiles

## 📨 Message Queue (Kafka)

The system uses Kafka for:
- User events (registration, profile updates)
- Job events (new postings, status changes)
- Application events (new applications, status updates)
- Company events (profile updates)

## 🛠️ Development

### Local Development

1. **Install dependencies for each service:**
   ```bash
   cd services/auth && npm install
   cd ../company && npm install
   cd ../job && npm install
   cd ../applicant && npm install
   cd ../admin && npm install
   ```

2. **Set environment variables:**
   ```bash
   export MONGO_URI="mongodb://localhost:27017/ats_auth"
   export JWT_SECRET="your_jwt_secret_key"
   export KAFKA_BROKERS="localhost:9092"
   ```

3. **Start services individually:**
   ```bash
   # Start auth service
   cd services/auth && npm start
   
   # Start other services in separate terminals
   cd services/company && npm start
   cd services/job && npm start
   cd services/applicant && npm start
   cd services/admin && npm start
   ```

## 🔧 Configuration

### Environment Variables

Each service uses the following environment variables:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `KAFKA_BROKERS` - Kafka broker addresses
- `PORT` - Service port (optional)

### Docker Configuration

The system is configured to run in Docker containers with:
- MongoDB for data persistence
- Kafka + Zookeeper for message queuing
- Nginx as API Gateway
- Each service in its own container

## 📊 Monitoring and Health Checks

Each service provides health check endpoints:
- Auth Service: `GET /health`
- Company Service: `GET /`
- Job Service: `GET /`
- Applicant Service: `GET /`
- Admin Service: `GET /health`

## 🚨 Troubleshooting

### Common Issues

1. **Service not starting:**
   - Check if MongoDB and Kafka are running
   - Verify environment variables are set correctly
   - Check service logs: `docker-compose logs <service-name>`

2. **Authentication errors:**
   - Ensure JWT_SECRET is consistent across all services
   - Check if Auth Service is running and accessible

3. **Database connection issues:**
   - Verify MongoDB is running and accessible
   - Check MONGO_URI format and credentials

### Logs

View logs for specific services:
```bash
docker-compose logs auth-service
docker-compose logs company-service
docker-compose logs job-service
docker-compose logs applicant-service
docker-compose logs admin-service
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.
