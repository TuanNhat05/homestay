const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URI || process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error('Missing MONGO_URI or MONGO_URL in environment variables');
  }

  await mongoose.connect(mongoUrl);
  console.log('MongoDB connected');
};

module.exports = connectDB;

