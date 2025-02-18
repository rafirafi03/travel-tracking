import app from "./app";
import dotenv from "dotenv";
import connectDB from "./config/db";
import { VercelRequest, VercelResponse } from '@vercel/node';
import { Request, Response } from 'express';


dotenv.config();

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch(err => {
    console.error("Failed to start server:", err);
  });
}

// Handle requests in a serverless environment
export default async function handler(req :VercelRequest | Request, res : VercelResponse | Response) {
  try {
    await connectDB();
    return app(req as Request, res as Response);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}