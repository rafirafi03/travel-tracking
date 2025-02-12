import axios from "axios";
import XLSX from "xlsx";
import TripModel from "../models/tripModel";
import GPSDataModel from "../models/gpsData";

export const uploadTrip = async (tripName: string, fileUrl: string) => {
  try {
    // Step 1: Save trip details
    const trip = await TripModel.create({ name: tripName, fileUrl });

    // Step 2: Download the Excel file
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const workbook = XLSX.read(response.data, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Step 3: Format GPS data and save it to MongoDB
    const formattedData = jsonData.map((row: any) => ({
      tripId: trip._id, // Reference to the trip
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      timestamp: new Date(row.timestamp),
      ignition: row.ignition,
    }));

    await GPSDataModel.insertMany(formattedData);
    return { message: "✅ Trip data uploaded successfully!" };
  } catch (error) {
    throw new Error("❌ Error processing file: " + error);
  }
};
