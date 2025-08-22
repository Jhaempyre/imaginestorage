import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // MongoDB connection using environment variables
    console.log(process.env.MONGODB_URI);
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
    
    console.log(`MongoDB connected!! DB host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
