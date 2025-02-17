import mongoose, { Document, Model } from "mongoose";

export interface GPSData {
  latitude: number;
  longitude: number;
  timestamp: String;
  ignition: string | boolean;
}

export interface ExcelRow {
  latitude: string | number;
  longitude: string | number;
  timestamp: Date | string;
  ignition: string;
}

export interface ITrip extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  name: string;
  gpsData: GPSData[];
}

export interface TripMetrics {
  totalDistance: string;
  totalDuration: string;
  overspeedDistance: string;
  overspeedDuration: string;
  stoppedDuration: string;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface RouteSegment {
  coordinates: Coordinate[];
  isOverspeeding: boolean;
}

export interface StoppedPoint {
  latitude: number;
  longitude: number;
  durationSeconds: number;
}

export interface IdlingPoint {
  latitude: number;
  longitude: number;
  durationSeconds: number;
}
