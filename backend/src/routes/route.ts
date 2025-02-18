import express from "express";
import {
  loginUser,
  uploadTripData,
  fetchTripsByUserId,
  deleteTripsByUserId,
  fetchTripsDetails,
  fetchDataCount,
  logout,
} from "../controllers/controller";
import upload from "../config/multerConfig";
import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/login", async (req, res) => {
  await loginUser(req, res);
});

router.post("/uploadTrip", upload.single("selectedFile"), async (req, res) => {
  await uploadTripData(req, res);
});

router.get("/fetchTrips/:userId", authMiddleware, async (req, res) => {
  await fetchTripsByUserId(req, res);
});

router.delete("/deleteTrips", authMiddleware,  async (req, res) => {
  await deleteTripsByUserId(req, res);
});

router.get("/fetchTripsDetails/:selectedTrips", authMiddleware, async (req, res) => {
  await fetchTripsDetails(req, res);
});

router.get('/fetchDataCount/:userId', authMiddleware, async (req, res) => {
  await fetchDataCount(req, res)
})

router.post('/logout', async(req, res) => {
  await logout(req, res)
})

export default router;
