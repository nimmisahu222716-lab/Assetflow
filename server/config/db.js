const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : '';

    if (mongoUri) {
      console.log(`Connecting to specified MongoDB URI: ${mongoUri.replace(/:([^@]+)@/, ':****@')}`);
    } else {
      console.log('No MONGODB_URI provided in server/.env. Booting in-memory MongoDB fallback server...');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log(`InMemory MongoDB Server running at ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected Successfully to Host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
