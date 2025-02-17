import mongoose from "mongoose";

const TripSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  gpsData: {
    type: [{
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      timestamp: { type: String, required: true },
      ignition: { type: String, required: true }
    }],
    required: true // Make gpsData array required
  }
});

const TripModel = mongoose.model("Trip", TripSchema);
export default TripModel;
