import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app: Application = express();

// Setting up the middleware for CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

// For JSON parsing
app.use(express.json({
  limit: "10mb"
}));

// For cookies
app.use(cookieParser());

// URL encoding
app.use(express.urlencoded({
  extended: true,
  limit: "16mb"
}));

// For serving static files from public directory
app.use(express.static("public"));

// Here we will set routers and all (🎀)

export { app };