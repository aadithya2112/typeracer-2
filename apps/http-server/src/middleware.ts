import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// JWT Secret should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET as string;

// Extend the Express Request interface to include a user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        [key: string]: any; // Allow for additional properties
      };
    }
  }
}

/**
 * Authentication middleware that verifies the JWT token
 * from the Authorization header and adds the decoded user to the request object
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: "Authentication required. No token provided.",
      });
      return;
    }

    // Check if the Authorization header has the Bearer scheme
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res.status(401).json({
        success: false,
        message:
          "Authentication failed. Token format should be: Bearer [token]",
      });
      return;
    }

    const token = parts[1] as string;

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      [key: string]: any;
    };

    // Add the decoded user to the request object
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.log("Invalid token:", error);
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Token expired",
      });
      return;
    }

    console.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
    return;
  }
};

// Optional middleware for routes that can have authenticated users
// but don't require authentication
export const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // Proceed without user info if no token
      return next();
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      // Proceed without user info if token format is invalid
      return next();
    }

    const token = parts[1] as string;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        [key: string]: any;
      };

      // Add the decoded user to the request object
      req.user = decoded;
    } catch (tokenError) {
      // If token verification fails, proceed without user info
      // No need to throw an error as authentication is optional
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Optional authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};
