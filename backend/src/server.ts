import app from "./app";
import dotenv from "dotenv";
import connectDB from "./config/db";

dotenv.config();

connectDB()


if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
