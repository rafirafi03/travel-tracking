import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoURI = process.env.MONGO_URI as string;

// Global variable to track connection status
let isConnected = false;

const connectDB = async () => {
  // If we're already connected, return the existing connection
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }

  try {
    const db = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);
    
    isConnected = !!db.connections[0].readyState;
    
    console.log("MongoDB connected successfully! ✅");
  } catch (error) {
    console.error("MongoDB connection failed ❌", error);
    throw error; // Don't exit process in serverless environment
  }
};

export default connectDB;