import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiRoutes from './src/routes/index.js';
import { errorHandler, notFoundHandler } from './src/middlewares/index.js';

const app: Application = express();

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({
  limit: "10mb"
}));

app.use(express.urlencoded({
  extended: true,
  limit: "16mb"
}));

// Static files
app.use(express.static("public"));

// Cookie parser
app.use(cookieParser());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'imaginaryStorage API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      docs: '/api/docs',
      auth: '/api/auth',
      users: '/api/users'
    }
  });
});

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

export { app };