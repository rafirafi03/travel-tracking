import mongoose from "mongoose";

const TripSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  gpsData: [{
    latitude: Number,
    longitude: Number,
    timestamp: Date,
    ignition: Boolean
}]
});

const TripModel = mongoose.model("Trip", TripSchema);
export default TripModel;
