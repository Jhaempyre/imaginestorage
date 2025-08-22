import dotenv from 'dotenv';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize dotenv
dotenv.config({
  path: join(__dirname, '.env'),
});
console.log("Loaded .env variables:");
console.log("PORT:", process.env.PORT);
console.log("MONGODB_URI:", process.env.MONGODB_URI);


import { app } from './app.js';
import connectDB from './src/db/database.js';

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