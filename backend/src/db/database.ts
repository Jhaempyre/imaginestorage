import mongoose from 'mongoose';
import { DB_NAME } from "../../constants"



const connectDB = async () => {
  try {
    
    console.log(DB_NAME)
    // MongoDB connection using environment variables
    console.log("url",process.env.MONGODB_URI);
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    
    console.log(`MongoDB connected!! DB host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
