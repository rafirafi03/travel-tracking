import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpStatusCode } from "../constants/httpStatusCode";

// Define a custom interface for the request object
interface AuthenticatedRequest extends Request {
  user?: any; // Attach user information to the request object
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.userToken;

  if (!token) {
    res.status(HttpStatusCode.UNAUTHORIZED).json({ success: false, message: "Unauthorized" }); // Send response
    return; // Return void
  }

  try {
    // Verify the token (replace 'your-secret-key' with your actual secret key)
    const decoded = jwt.verify(token, "travel-token");
    req.user = decoded; // Attach the decoded user information to the request object
    next(); // Call the next middleware
  } catch (err) {
    res.status(HttpStatusCode.UNAUTHORIZED).json({ success: false, message: "Invalid token" }); // Send response
    return; // Return void
  }
};

export default authMiddleware;