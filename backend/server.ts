import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { app } from './app';
import connectDB from './src/db/database';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


// Initialize dotenv
dotenv.config({
  path: join(__dirname, '..', '.env'),
});

console.log("Bharat mata ki jai");
console.log("PORT:", process.env.PORT);

// Connecting to MongoDB and starting the server
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failure!!!", err);
  });