import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { HttpStatusCode } from "../constants/httpStatusCode";
import User from "../models/userModel";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import XLSX from "xlsx";
import TripModel from "../models/tripModel";
import { ExcelRow, GPSData} from "../interfaces/interface";
import axios from "axios";
import mongoose from 'mongoose';
import geolib from 'geolib'
import { calculateTripMetrics } from "../services/tripAnalyzeService";

dotenv.config();

export const loginUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      // Compare entered password with hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ error: "Invalid credentials" });
      }
    } else {
      // Create new user if not found
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({ email, password: hashedPassword });
      await user.save();
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "defaultSecret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as jwt.SignOptions
    );

    return res.status(HttpStatusCode.CREATED).json({
      success: true,
      message: "User created successfully",
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Error logging in user" });
  }
};

export const uploadTripData = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { tripName, userId } = req.body;
    const excelFile = req.file;

    if (!excelFile) {
      console.log("no excel file");
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "No excel file found" });
    }

    console.log("excel file exists");

    try {
      // Download file from Cloudinary
      const response = await axios({
        url: excelFile.path,
        method: "GET",
        responseType: "arraybuffer",
      });

      // Convert array buffer to buffer
      const buffer = Buffer.from(response.data);

      // Read from buffer directly
      const workbook = XLSX.read(buffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];

      const gpsData = data.map((row) => ({
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        timestamp: new Date(row.timestamp),
        ignition: Boolean(row.ignition),
      }));

      console.log("gpsData:", gpsData);

      const trip = new TripModel({
        userId,
        name: tripName,
        gpsData: gpsData,
      });

      await trip.save();

      return res
        .status(HttpStatusCode.OK)
        .json({ success: true, message: "trip data saved successfully" });
    } catch (excelError) {
      console.error("Error processing Excel file:", excelError);
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error processing Excel file",
        error:
          excelError instanceof Error ? excelError.message : "Unknown error",
      });
    }
  } catch (error) {
    return res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "❌ Error processing data", error });
  }
};

export const fetchTripsByUserId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;

    const tripDatas = await TripModel.find({ userId });

    const formattedTrips = tripDatas.map((trip) => ({
      ...trip.toObject(),
      gpsData: trip.gpsData.map((data) => ({
        ...data,
        timestamp: data.timestamp ? new Date(data.timestamp) : null,
      })),
    }));

    return res
      .status(HttpStatusCode.OK)
      .json(formattedTrips.length ? formattedTrips : []);
  } catch (error) {
    return res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "❌ Error processing data", error });
  }
};

export const deleteTripsByUserId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userId, selectedTrips } = req.body;
    console.log(req.body);

    if (
      !userId ||
      !Array.isArray(selectedTrips) ||
      selectedTrips.length === 0
    ) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid input data" });
    }

    const response = await TripModel.deleteMany({
      _id: { $in: selectedTrips },
      userId: userId,
    });

    return res
      .status(HttpStatusCode.OK)
      .json({ success: true, deletedCount: response.deletedCount });
  } catch (error) {
    return res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "❌ Error processing data", error });
  }
};

export const fetchTripsDetails = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const tripIds = req.params.selectedTrips.split(',');
    
    if (!tripIds.length) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ 
        success: false, 
        message: 'No trip IDs provided' 
      });
    }

    const trips = await TripModel.find({ _id: { $in: tripIds } });

    const tripsWithMetrics = trips.map(trip => {
      const metrics = calculateTripMetrics(trip.gpsData);
      return {
        tripId: trip._id,
        name: trip.name,
        userId: trip.userId,
        metrics
      };
    });

    return res.status(HttpStatusCode.OK).json({
      success: true,
      data: tripsWithMetrics
    });

  } catch (error) {
    console.error('Error processing trips:', error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "❌ Error processing data",
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};
