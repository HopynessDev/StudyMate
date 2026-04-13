const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/studymate');

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('MongoDB Connection Error:');
    console.error(error.message);
    console.log('\nMongoDB is not running. The application will start but database features will be limited.');
    console.log('To start MongoDB locally:');
    console.log('  1. Run: mongod');
    console.log('  2. Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas');
    console.log('  3. Update MONGODB_URI in .env file');
    console.log('\nApplication starting with limited functionality...\n');
    // Don't exit the process, allow app to run without MongoDB for testing UI
  }
};

module.exports = connectDB;