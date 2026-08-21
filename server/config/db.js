const mongoose = require('mongoose');

// Default MongoDB Atlas Cloud URI fallback for Vercel / cloud deployments
const DEFAULT_MONGO_URI = 'mongodb+srv://assetflow_demo:DemoAssetFlow2026@cluster0.p7j7j.mongodb.net/assetflow_erp?retryWrites=true&w=majority';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    let mongoUri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : '';

    if (!mongoUri) {
      if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production') {
        console.log('Cloud deployment detected without custom MONGODB_URI. Connecting to default cloud MongoDB Atlas database...');
        mongoUri = DEFAULT_MONGO_URI;
      } else {
        console.log('No MONGODB_URI provided. Booting in-memory MongoDB fallback server...');
        try {
          const { MongoMemoryServer } = require('mongodb-memory-server');
          const mongoServer = await MongoMemoryServer.create();
          mongoUri = mongoServer.getUri();
          console.log(`InMemory MongoDB Server running at ${mongoUri}`);
        } catch (memErr) {
          console.log('MongoMemoryServer fallback failed, connecting to default cloud MongoDB Atlas database...');
          mongoUri = DEFAULT_MONGO_URI;
        }
      }
    }

    console.log(`Connecting to MongoDB...`);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000
    });

    console.log(`MongoDB Connected Successfully to Host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
