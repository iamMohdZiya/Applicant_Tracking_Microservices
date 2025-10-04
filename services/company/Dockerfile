# --- Applicant Service Dockerfile ---

# Use the lightweight 'alpine' version of the Node 18 image 
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Set the environment to production for optimized installation
ENV NODE_ENV=production

# 1. Dependency Caching Layer
# Copy package.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies, omitting dev dependencies for a small image
RUN npm install --omit=dev

# 2. Source Code Layer
# Copy all the necessary application files
COPY . .

# Expose the application port (5000 is the next logical port)
EXPOSE 5000

# Set the PORT environment variable
ENV PORT 5000

# Command to run the application (assuming the main file is 'app.js')
CMD ["node", "app.js"]
# ```eof

# Now that the Applicant Service is ready for containerization, let's finish its Express API structure. Should we proceed with the **Applicant Routes** (`services/applicant/routes/applicantRoutes.js`)?