import mongoose, { Document, Model } from 'mongoose';

export interface GPSData {
    latitude: number;
    longitude: number;
    timestamp: Date;
    ignition: boolean;
}

export interface ExcelRow {
    latitude: string | number;
    longitude: string | number;
    timestamp: string | number;
    ignition: string | number | boolean;
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
    overspeedDuration : string;
    stoppedDuration: string;
  }
