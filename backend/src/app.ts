import express from "express";
import cors from "cors";
import routes from "./routes/route";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "https://travel-tracking.vercel.app/",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api", routes);

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;
