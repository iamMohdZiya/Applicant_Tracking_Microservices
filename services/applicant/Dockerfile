# --- Applicant Service Dockerfile ---

# Use the lightweight 'alpine' version of the Node 18 image 
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Set the environment to production for optimized installation
# This is a key microservices best practice.
ENV NODE_ENV=production

# 1. Dependency Caching Layer
# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies, omitting dev dependencies for a small image
RUN npm install --omit=dev

# 2. Source Code Layer
# Copy all the necessary application files
# Assuming main file is named 'server.js' based on your last request
COPY . .

# Expose the application port (5000 is the next logical port)
EXPOSE 5000

# Set the PORT environment variable explicitly (good for running without Compose)
ENV PORT 5000

# Command to run the application (using server.js as the entry point)
CMD ["node", "server.js"]