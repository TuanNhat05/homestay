require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Log environment status on startup (without exposing secrets)
console.log('=== Environment Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', PORT);
console.log('MONGO_URL:', process.env.MONGO_URL ? 'SET' : 'NOT SET');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'not set');
console.log('=========================');

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    // Still start the server so health check works and Render doesn't restart loop
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (WITHOUT database)`);
    });
  }
};

startServer();
