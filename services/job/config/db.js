const mongoose = require('mongoose');

// Function to establish connection to MongoDB
const connectDB = async (dbUri) => {
    // Check if the URI is provided
    if (!dbUri) {
        console.error('FATAL ERROR: MongoDB connection URI is not defined.');
        // In a real application, you might exit the process here: process.exit(1);
        return;
    }

    try {
        // Mongoose connection options (modern best practices)
        const connectionOptions = {
            // These options are now default in modern Mongoose versions but included for clarity
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s if server not found
            // You can add more options here, like connection pool size
        };

        await mongoose.connect(dbUri, connectionOptions);

        console.log('MongoDB successfully connected.');

        // Optional: Listen for disconnection events
        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose default connection disconnected.');
        });

    } catch (error) {
        console.error('MongoDB connection FAILED:', error.message);
        // In a microservice, a failure to connect to the database is often fatal.
        // We might want to retry or exit the process here to allow the orchestrator (like Kubernetes) to restart the container.
        // process.exit(1);
    }
};

module.exports = connectDB;
