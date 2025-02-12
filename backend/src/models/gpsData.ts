import mongoose from "mongoose";

const GPSDataSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  latitude: Number,
  longitude: Number,
  timestamp: Date,
  ignition: Boolean,
});

const GPSDataModel = mongoose.model("GPSData", GPSDataSchema);
export default GPSDataModel;
