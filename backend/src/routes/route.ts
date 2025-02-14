import express from "express";
import {
  loginUser,
  uploadTripData,
  fetchTripsByUserId,
  deleteTripsByUserId,
  fetchTripsDetails,
} from "../controllers/controller";
import upload from "../config/multerConfig";

const router = express.Router();

router.post("/login", async (req, res) => {
  await loginUser(req, res);
});

router.post("/uploadTrip", upload.single("selectedFile"), async (req, res) => {
  await uploadTripData(req, res);
});

router.get("/fetchTrips/:userId", async (req, res) => {
  await fetchTripsByUserId(req, res);
});

router.delete("/deleteTrips", async (req, res) => {
  await deleteTripsByUserId(req, res);
});

router.get("/fetchTripsDetails/:selectedTrips", async (req, res) => {
  await fetchTripsDetails(req, res);
});

export default router;
