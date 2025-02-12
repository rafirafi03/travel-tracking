import express from "express";
import cors from "cors";
import routes from './routes/route'

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE"], 
    allowedHeaders: ["Content-Type", "Authorization"], 
  })
);

app.use('/api', routes)

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;