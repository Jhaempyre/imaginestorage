import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({
  path: join(__dirname, '.env'),
});

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Set default values for optional environment variables
process.env.PORT = process.env.PORT || '8000';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
process.env.REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

console.log("Starting imaginaryStorage API...");

import connectDB from './src/db/database.js';
import { app } from './app.js';

// Initialize services and start server
async function startServer() {
  try {
    // 1. Connect to database
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // 2. Start the server
    const PORT = process.env.PORT;
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running at port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('\n🔧 Development Mode - Additional logging enabled');
        console.log('📋 Available endpoints:');
        console.log('   🔐 Authentication: /api/auth/*');
        console.log('   👤 User Management: /api/users/*');
        console.log('   📁 File Management: /api/files/*');
        console.log('   ☁️  Storage Management: /api/storage/*');
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});