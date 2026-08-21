const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    let mongoUri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : '';

    if (mongoUri) {
      console.log(`Connecting to specified MongoDB URI: ${mongoUri.replace(/:([^@]+)@/, ':****@')}`);
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`MongoDB Connected Successfully to Host: ${conn.connection.host}`);
      return conn;
    } else {
      console.log('No MONGODB_URI provided. Booting in-memory MongoDB fallback server...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();
        console.log(`InMemory MongoDB Server running at ${mongoUri}`);
        const conn = await mongoose.connect(mongoUri);
        return conn;
      } catch (memErr) {
        console.error('MongoMemoryServer initialization failed (serverless environment):', memErr.message);
        throw new Error('Database connection failed. Please set MONGODB_URI environment variable in Vercel.');
      }
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
