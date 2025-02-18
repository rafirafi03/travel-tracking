import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { HttpStatusCode } from "../constants/httpStatusCode";
import User from "../models/userModel";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import XLSX from "xlsx";
import TripModel from "../models/tripModel";
import {
  Coordinate,
  ExcelRow,
  GPSData,
  IdlingPoint,
  RouteSegment,
  StoppedPoint,
} from "../interfaces/interface";
import axios from "axios";
import mongoose from "mongoose";
import geolib, { getDistance } from "geolib";
import moment from "moment";
import { convertExcelDateToJSDate } from "../services/excelDatetoJsDate";
import { formatTime } from "../utils/helper";

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
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" } as jwt.SignOptions
    );

    res.cookie("userToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 3600000,
    });

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

    console.log("excelFile:", excelFile);

    if (!excelFile) {
      console.log("no excel file");
      return res
        .status(HttpStatusCode.BAD_REQUEST)
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

      const gpsData = data.map((row: ExcelRow) => {
        console.log(
          "Raw timestamp:",
          row.timestamp,
          "Type:",
          typeof row.timestamp
        );

        if (row.timestamp === undefined || row.timestamp === null) {
          console.error("Invalid or missing timestamp in row:", row);
          throw new Error("Invalid or missing timestamp in row");
        }

        let formattedTimestamp: string;

        // ✅ Case 1: If timestamp is a number (Excel format)
        if (typeof row.timestamp === "number") {
          const excelEpoch = new Date(1899, 11, 30); // Excel epoch in **LOCAL TIME**
          const timestampDate = new Date(
            excelEpoch.getTime() + row.timestamp * 86400000
          );

          // 🔹 Extract local time without UTC conversion
          const year = timestampDate.getFullYear();
          const month = String(timestampDate.getMonth() + 1).padStart(2, "0");
          const day = String(timestampDate.getDate()).padStart(2, "0");
          const hours = String(timestampDate.getHours()).padStart(2, "0");
          const minutes = String(timestampDate.getMinutes()).padStart(2, "0");
          const seconds = String(timestampDate.getSeconds()).padStart(2, "0");

          formattedTimestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }

        // ✅ Case 2: If timestamp is already a string, use it directly
        else if (typeof row.timestamp === "string") {
          formattedTimestamp = row.timestamp;
        } else {
          throw new Error(
            "Invalid timestamp format in row: " + JSON.stringify(row)
          );
        }

        return {
          latitude: parseFloat(Number(row.latitude).toFixed(8)),
          longitude: parseFloat(Number(row.longitude).toFixed(8)),
          timestamp: formattedTimestamp, // ✅ Preserves local time
          ignition: row.ignition,
        };
      });

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
        message: "Error processing Excel files",
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
    const { page = "1" } = req.query; // Default page is '1' as a string
    const pageNumber = parseInt(page as string, 10); // Convert the string to a number

    // Validate if the parsed pageNumber is a valid integer
    if (isNaN(pageNumber) || pageNumber < 1) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid page number" });
    }

    const tripsPerPage = 10; // Define the number of trips per page
    const skip = (pageNumber - 1) * tripsPerPage; // Calculate the number of trips to skip

    // Fetch the paginated trips data
    const tripDatas = await TripModel.find({ userId })
      .skip(skip) // Skip the appropriate number of documents
      .limit(tripsPerPage); // Limit the results to the specified number of trips per page

    console.log("tripDatas:", tripDatas);

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
    const tripIds = req.params.selectedTrips.split(",");

    const { page } = req.query;
    const pageNumber = Number(page);

    console.log("tripIds:", tripIds);

    if (!tripIds.length) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "No trip IDs provided",
      });
    }

    const trips = await TripModel.find({ _id: { $in: tripIds } });
    console.log("trips:", trips);

    // Calculate distance for each trip
    const tripsWithDetails = trips.map((trip) => {
      let totalDistanceMeters = 0;
      let overspeedDistanceMeters = 0;
      let durationSeconds = 0;
      let overspeedSeconds = 0;
      let stoppedSeconds = 0;
      let idlingSeconds = 0;

      const gpsData = trip.gpsData;
      const activeGpsData = gpsData.filter((point) => point.ignition === "on");

      // Initialize array to hold route segments with explicit type
      const routeSegments: RouteSegment[] = [];
      let currentSegment: RouteSegment = {
        coordinates: [] as Coordinate[],
        isOverspeeding: false,
      };

      // Array to track points where vehicle stopped (ignition turned off)
      let stoppedPoints: StoppedPoint[] = [];
      let stopStartIndex = -1;

      // Array to track points where vehicle is idling (ignition on but speed is 0)
      let idlingPoints: IdlingPoint[] = [];
      let idleStartIndex = -1;

      if (gpsData.length > 0) {
        // Add first coordinate to the first segment
        currentSegment.coordinates.push({
          latitude: gpsData[0].latitude,
          longitude: gpsData[0].longitude,
        });
      }

      if (activeGpsData.length > 0) {
        // Get first and last timestamp
        const startTime = new Date(activeGpsData[0].timestamp).getTime();
        const endTime = new Date(
          activeGpsData[activeGpsData.length - 1].timestamp
        ).getTime();

        // Calculate total duration in seconds
        durationSeconds = (endTime - startTime) / 1000;
      }

      for (let i = 0; i < gpsData.length - 1; i++) {
        const currentPoint = {
          latitude: gpsData[i].latitude,
          longitude: gpsData[i].longitude,
          timestamp: gpsData[i].timestamp,
          ignition: gpsData[i].ignition,
        };

        const nextPoint = {
          latitude: gpsData[i + 1].latitude,
          longitude: gpsData[i + 1].longitude,
          timestamp: gpsData[i + 1].timestamp,
          ignition: gpsData[i + 1].ignition,
        };

        // Check if vehicle just stopped (ignition changed from on to off)
        if (currentPoint.ignition === "on" && nextPoint.ignition === "off") {
          stopStartIndex = i + 1; // Record the index where vehicle stopped
        }

        // Check if vehicle just started moving (ignition changed from off to on)
        if (
          currentPoint.ignition === "off" &&
          nextPoint.ignition === "on" &&
          stopStartIndex !== -1
        ) {
          // Calculate stop duration
          const stopStart = new Date(
            gpsData[stopStartIndex].timestamp
          ).getTime();
          const stopEnd = new Date(currentPoint.timestamp).getTime();
          const stopDurationSeconds = (stopEnd - stopStart) / 1000;

          stoppedPoints.push({
            latitude: gpsData[stopStartIndex].latitude,
            longitude: gpsData[stopStartIndex].longitude,
            durationSeconds: stopDurationSeconds,
          });

          stopStartIndex = -1; // Reset stop start index
        }

        const timeDiffSeconds =
          (new Date(nextPoint.timestamp).getTime() -
            new Date(currentPoint.timestamp).getTime()) /
          1000;

        if (currentPoint.ignition === "on") {
          // Calculate distance and speed
          const segmentDistance = getDistance(currentPoint, nextPoint);
          const speedKmh = segmentDistance / 1000 / (timeDiffSeconds / 3600); // Convert m/s to km/h

          // Check for idling - ignition on but not moving (speed close to 0)
          if (segmentDistance < 0.5) {
            // Less than 0.5 meters movement considered as idling
            if (idleStartIndex === -1) {
              // Start of new idling period
              idleStartIndex = i;
            }
          } else {
            // Vehicle is moving
            if (idleStartIndex !== -1) {
              // Calculate idle duration
              const idleStart = new Date(
                gpsData[idleStartIndex].timestamp
              ).getTime();
              const idleEnd = new Date(currentPoint.timestamp).getTime();
              const idleDurationSeconds = (idleEnd - idleStart) / 1000;

              if (idleDurationSeconds > 10) {
                // Only record idling periods longer than 10 seconds
                idlingPoints.push({
                  latitude: gpsData[idleStartIndex].latitude,
                  longitude: gpsData[idleStartIndex].longitude,
                  durationSeconds: idleDurationSeconds,
                });

                idlingSeconds += idleDurationSeconds;
              }

              idleStartIndex = -1; // Reset idle start index
            }

            totalDistanceMeters += segmentDistance;

            const isCurrentSegmentOverspeeding = speedKmh > 60;

            // Check if we need to start a new segment due to speed change
            if (
              isCurrentSegmentOverspeeding !== currentSegment.isOverspeeding &&
              currentSegment.coordinates.length > 0
            ) {
              // Add the current point to complete the current segment
              currentSegment.coordinates.push({
                latitude: currentPoint.latitude,
                longitude: currentPoint.longitude,
              });
              routeSegments.push(currentSegment);

              // Start a new segment
              currentSegment = {
                coordinates: [
                  {
                    latitude: currentPoint.latitude,
                    longitude: currentPoint.longitude,
                  },
                ],
                isOverspeeding: isCurrentSegmentOverspeeding,
              };
            }

            // Add the next point to the current segment
            currentSegment.coordinates.push({
              latitude: nextPoint.latitude,
              longitude: nextPoint.longitude,
            });

            if (speedKmh > 60) {
              overspeedDistanceMeters += segmentDistance;
              overspeedSeconds += timeDiffSeconds;
            }
          }
        } else {
          // Ignition is off, add to stopped time
          stoppedSeconds += timeDiffSeconds;

          // If we were previously idling and now ignition is off
          if (idleStartIndex !== -1) {
            idleStartIndex = -1; // Reset idle index since we're now stopped, not idling
          }
        }
      }

      // Check if trip ended while vehicle was stopped
      if (stopStartIndex !== -1 && gpsData.length > 0) {
        const lastIndex = gpsData.length - 1;
        const stopStart = new Date(gpsData[stopStartIndex].timestamp).getTime();
        const stopEnd = new Date(gpsData[lastIndex].timestamp).getTime();
        const stopDurationSeconds = (stopEnd - stopStart) / 1000;

        stoppedPoints.push({
          latitude: gpsData[stopStartIndex].latitude,
          longitude: gpsData[stopStartIndex].longitude,
          durationSeconds: stopDurationSeconds,
        });
      }

      // Check if trip ended while vehicle was idling
      if (idleStartIndex !== -1 && gpsData.length > 0) {
        const lastIndex = gpsData.length - 1;
        const idleStart = new Date(gpsData[idleStartIndex].timestamp).getTime();
        const idleEnd = new Date(gpsData[lastIndex].timestamp).getTime();
        const idleDurationSeconds = (idleEnd - idleStart) / 1000;

        if (idleDurationSeconds > 10) {
          // Only record idling periods longer than 10 seconds
          idlingPoints.push({
            latitude: gpsData[idleStartIndex].latitude,
            longitude: gpsData[idleStartIndex].longitude,
            durationSeconds: idleDurationSeconds,
          });

          idlingSeconds += idleDurationSeconds;
        }
      }

      // Add the last segment if it has points
      if (currentSegment.coordinates.length > 0) {
        routeSegments.push(currentSegment);
      }

      // Convert meters to kilometers
      const totalDistanceKm = totalDistanceMeters / 1000;
      const overspeedDistanceKm = overspeedDistanceMeters / 1000;

      // Format distances
      const formattedDistance = `${totalDistanceKm.toFixed(2)} KM`;
      const formattedOverspeedDistance = `${overspeedDistanceKm.toFixed(2)} KM`;

      // Format total duration
      const totalMinutes = Math.floor(durationSeconds / 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const formattedDuration =
        hours > 0 ? `${hours} Hr ${minutes} Min` : `${minutes} Min`;

      // Format overspeed duration
      const overspeedMinutes = Math.floor(overspeedSeconds / 60);
      const overspeedHours = Math.floor(overspeedMinutes / 60);
      const overspeedRemainingMinutes = overspeedMinutes % 60;
      const formattedOverspeedDuration =
        overspeedHours > 0
          ? `${overspeedHours} Hr ${overspeedRemainingMinutes} Min`
          : `${overspeedRemainingMinutes} Min`;

      // Format stopped duration
      const stoppedMinutes = Math.floor(stoppedSeconds / 60);
      const stoppedHours = Math.floor(stoppedMinutes / 60);
      const stoppedRemainingMinutes = stoppedMinutes % 60;
      const formattedStoppedDuration =
        stoppedHours > 0
          ? `${stoppedHours} Hr ${stoppedRemainingMinutes} Min`
          : `${stoppedRemainingMinutes} Min`;

      // Format idling duration
      const idlingMinutes = Math.floor(idlingSeconds / 60);
      const idlingHours = Math.floor(idlingMinutes / 60);
      const idlingRemainingMinutes = idlingMinutes % 60;
      const formattedIdlingDuration =
        idlingHours > 0
          ? `${idlingHours} Hr ${idlingRemainingMinutes} Min`
          : `${idlingRemainingMinutes} Min`;

      // NEW ADDITION: Format GPS points for frontend table
      let tableDetails = gpsData.map((point, index, arr) => {
        // Format time range - for demonstration we'll use the current point's timestamp
        // For actual time ranges, you'd need consecutive points
        const startTime = new Date(point.timestamp);
        const endTime =
          index < arr.length - 1
            ? new Date(arr[index + 1].timestamp)
            : startTime;

        // Format coordinates in the required format
        const formattedCoordinates = `${point.latitude}° N, ${point.longitude}° W`;

        // Calculate speed in KM/H if available
        let speedKmh = "";

        if (index < arr.length - 1) {
          const nextPoint = arr[index + 1];

          if (point.ignition === "on") {
            // Convert custom timestamp format to ISO format
            const currentTimestamp = new Date(
              point.timestamp.replace(" ", "T")
            ).getTime();
            const nextTimestamp = new Date(
              nextPoint.timestamp.replace(" ", "T")
            ).getTime();

            if (isNaN(currentTimestamp) || isNaN(nextTimestamp)) {
              console.error(
                "Invalid timestamps:",
                point.timestamp,
                nextPoint.timestamp
              );
            } else {
              const timeDiffSeconds = (nextTimestamp - currentTimestamp) / 1000;

              if (timeDiffSeconds > 0) {
                // Use geolibs' getDistance function
                const distance = getDistance(
                  { latitude: point.latitude, longitude: point.longitude },
                  {
                    latitude: nextPoint.latitude,
                    longitude: nextPoint.longitude,
                  }
                );

                if (
                  distance !== undefined &&
                  !isNaN(distance) &&
                  distance > 0
                ) {
                  const speed = distance / 1000 / (timeDiffSeconds / 3600); // Speed in KM/H

                  if (!isNaN(speed) && speed > 0) {
                    speedKmh = `${speed.toFixed(1)} KM/H`;
                  }
                } else {
                  console.log("Distance is invalid:", distance);
                }
              }
            }
          }
        }

        return {
          timeRange: `${formatTime(startTime)} to ${formatTime(endTime)}`,
          coordinates: formattedCoordinates,
          ignition: point.ignition.toUpperCase(),
          speed: speedKmh,
        };
      });

      const pageSize = 10;

      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = pageNumber * pageSize;

      tableDetails = tableDetails.slice(startIndex, endIndex);

      // Return the original formatted trip data plus the new tableDetails field
      return {
        ...trip.toObject(),
        totalDistance: formattedDistance,
        overspeedDistance: formattedOverspeedDistance,
        duration: formattedDuration,
        overspeedDuration: formattedOverspeedDuration,
        stoppedDuration: formattedStoppedDuration,
        idlingDuration: formattedIdlingDuration,
        routeSegments: routeSegments,
        stoppedPoints: stoppedPoints,
        idlingPoints: idlingPoints,
        tableDetails: tableDetails, // New field added without changing existing code
      };
    });

    return res.status(HttpStatusCode.OK).json({
      success: true,
      data: tripsWithDetails,
    });
  } catch (error) {
    console.error("Error processing trips:", error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "❌ Error processing data",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

export const fetchDataCount = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;

    const count = await TripModel.find({ userId }).countDocuments();

    return res.status(HttpStatusCode.OK).json({
      success: true,
      data: count,
    });
  } catch (error) {
    console.error("Error processing trips:", error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "❌ Error processing data",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

export const logout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    res.setHeader("Set-Cookie", [
      "userToken=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 UTC",
    ]);
    return res
      .status(HttpStatusCode.OK)
      .json({ success: true, message: "logged out" });
  } catch (error) {
    console.error("Error processing trips:", error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "❌ Error processing data",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};
