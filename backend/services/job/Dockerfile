# --- Intermediate Single-Stage Dockerfile (Node.js) ---
# Using the lightweight 'alpine' version of the Node 18 image
# for a smaller final container size, which is best practice.
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Set the environment to production for optimized dependency installation
ENV NODE_ENV=production

# 1. Dependency Caching Layer
Copy package.json and package-lock.json first.
# This layer only rebuilds if the dependencies change, saving time.
COPY package*.json ./

# Install dependencies, omitting dev dependencies
RUN npm install --omit=dev

# 2. Source Code Layer
Copy all the application files needed to run the service
COPY server.js .
COPY job.routes.js .
COPY job.controller.js .
COPY db.config.js .
COPY job.schema.js .

# Expose the application port (3000 for the Job Service)
EXPOSE 3000

# Set the PORT environment variable
ENV PORT 3000

# Command to run the application (the entry point)
CMD ["node", "server.js"]