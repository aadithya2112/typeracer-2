import { Router, Request, Response } from "express";
import { prisma } from "@repo/db/client";
import { UserSchema } from "@repo/schemas/schemas";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { authMiddleware } from "../middleware";

dotenv.config();

// JWT Secret should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET as string;
// const JWT_EXPIRY = "24h";

export const UserRouter: Router = Router();

UserRouter.get("/", async (req: Request, res: Response) => {
  res.send("User route is working!");
});

UserRouter.get("/secret", authMiddleware, (req: Request, res: Response) => {
  res.send("Secret route is working!");
});

UserRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const validateData = UserSchema.safeParse({
      name,
      email,
      password,
    });

    if (!validateData.success) {
      res.status(400).json({
        success: false,
        error: validateData.error.errors,
        message: "Invalid input data",
      });
      return;
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
      },
      JWT_SECRET
    );

    // Return the created user (excluding password) with token
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

UserRouter.post("/signin", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input data
    const validateData = UserSchema.pick({ email, password }).safeParse({
      email,
      password,
    });

    if (!validateData.success) {
      res.status(400).json({
        success: false,
        error: validateData.error?.errors,
        message: "Invalid input data",
      });
      return;
    }

    // Find user with email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Check if user exists
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET
    );

    // Return user data (excluding password) with token
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: "Sign in successful",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// TODO: Return average wpm, highest wpm, accuracy and number of races
UserRouter.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: "User data retrieved successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// TODO: Add a route to save practice session data
