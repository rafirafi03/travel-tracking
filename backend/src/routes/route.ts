import express from 'express';
import { loginUser, uploadTripData, fetchTripsByUserId } from '../controllers/controller';
import upload from '../config/multerConfig';

const router = express.Router()

router.post('/login', async (req, res) => {
    await loginUser(req, res)
})

router.post('/uploadTrip', upload.single("selectedFile"), async (req, res) => {
    await uploadTripData(req, res)
})

router.get('/fetchTrips/:userId', async (req, res) => {
    await fetchTripsByUserId(req, res)
})

export default router;