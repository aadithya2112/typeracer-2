import { Router, Request, Response } from "express";
import { prisma } from "@repo/db/client";
import {
  RoomSchema,
  JoinRoomSchema,
  CreateRaceSchema,
} from "@repo/schemas/schemas";
import { authMiddleware } from "../middleware";
import { z } from "zod";

export const RoomRouter: Router = Router();

// Create a new game room
RoomRouter.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = RoomSchema.parse(req.body);

    // Create the room in the database
    const room = await prisma.room.create({
      data: {
        name: validatedData.name,
        adminId: req.user?.userId as string,
        isActive: validatedData.isActive,
        isPrivate: validatedData.isPrivate,
        password: validatedData.password,
      },
    });

    // Return the created room without password
    const { password, ...roomWithoutPassword } = room;
    res.status(201).json({
      success: true,
      data: roomWithoutPassword,
      message: "Room created successfully",
    });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Invalid room data",
        errors: error.errors,
      });
      return;
    }

    // Handle unique constraint error
    if ((error as any).code === "P2002") {
      res.status(409).json({
        success: false,
        message: "Room name already exists",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create room",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
    return;
  }
});

// Get a list of active rooms
RoomRouter.get("/", async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        isPrivate: true,
        createdAt: true,
        adminId: true,
        admin: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            races: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: rooms,
      timestamp: "2025-03-29 14:46:33", // Using the provided timestamp
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
    return;
  }
});

// Get details of a specific room
RoomRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        isPrivate: true,
        createdAt: true,
        adminId: true,
        admin: {
          select: {
            id: true,
            name: true,
          },
        },
        races: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
          select: {
            id: true,
            startTime: true,
            endTime: true,
            _count: {
              select: {
                raceHistories: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      res.status(404).json({
        success: false,
        message: "Room not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch room details",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
});

// Join a room
// Route 1: Join a room
RoomRouter.post(
  "/join",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = JoinRoomSchema.parse(req.body);

      // Check if room exists
      const room = await prisma.room.findUnique({
        where: {
          id: validatedData.roomId,
          isActive: true,
        },
      });

      if (!room) {
        res.status(404).json({
          success: false,
          message: "Room not found or inactive",
        });
        return;
      }

      // Check if room is private and password is correct
      if (room.isPrivate) {
        if (!validatedData.password) {
          res.status(401).json({
            success: false,
            message: "Password required for private room",
          });
          return;
        }

        if (room.password !== validatedData.password) {
          res.status(401).json({
            success: false,
            message: "Incorrect password",
          });
          return;
        }
      }

      // Get active race in the room
      const activeRace = await prisma.race.findFirst({
        where: {
          roomId: room.id,
          isActive: true,
        },
      });

      res.status(200).json({
        success: true,
        data: {
          room: {
            id: room.id,
            name: room.name,
            isPrivate: room.isPrivate,
            hasActiveRace: !!activeRace,
          },
          race: activeRace
            ? {
                id: activeRace.id,
                startTime: activeRace.startTime,
                textContent: activeRace.textContent,
              }
            : null,
        },
        message: "Successfully joined room",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid join request",
          errors: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Failed to join room",
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }
);

// Route 2: Create a new race in a room
RoomRouter.post(
  "/create-race",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = CreateRaceSchema.parse(req.body);

      // Check if room exists
      const room = await prisma.room.findUnique({
        where: {
          id: validatedData.roomId,
          isActive: true,
        },
      });

      if (!room) {
        res.status(404).json({
          success: false,
          message: "Room not found or inactive",
        });
        return;
      }

      // Check if user is admin, only admins can start a race
      const isAdmin = room.adminId === req.user?.userId;
      if (!isAdmin) {
        res.status(403).json({
          success: false,
          message: "Only room admins can create races",
        });
        return;
      }

      // Check if there's already an active race
      const existingActiveRace = await prisma.race.findFirst({
        where: {
          roomId: room.id,
          isActive: true,
        },
      });

      if (existingActiveRace) {
        res.status(400).json({
          success: false,
          message: "An active race already exists in this room",
          raceId: existingActiveRace.id,
        });
        return;
      }

      // Create a sample text for racing (in production, you'd have a proper text selection)
      const sampleText =
        validatedData.textContent ||
        "The quick brown fox jumps over the lazy dog. This is a sample text for typing race.";

      // Create a new race
      const newRace = await prisma.race.create({
        data: {
          roomId: room.id,
          textContent: sampleText,
          isActive: true,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          race: {
            id: newRace.id,
            startTime: newRace.startTime,
            textContent: newRace.textContent,
          },
        },
        message: "Successfully created new race",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid race creation request",
          errors: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Failed to create race",
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }
);

// Leave a room and race
RoomRouter.post(
  "/leave/:roomId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const roomId = req.params.roomId;
      const userId = req.user?.userId as string;

      // Check if room exists
      const room = await prisma.room.findUnique({
        where: {
          id: roomId,
          isActive: true,
        },
      });

      if (!room) {
        res.status(404).json({
          success: false,
          message: "Room not found or inactive",
        });
        return;
      }

      // Check if user is in an active race in this room
      const activeRace = await prisma.race.findFirst({
        where: {
          roomId: roomId,
          isActive: true,
        },
      });

      if (activeRace) {
        // If user is in an active race, we might want to record their exit or update stats
        // This depends on your application logic - for now we'll just acknowledge it
        console.log(`User ${userId} left active race ${activeRace.id}`);
      }

      // Get all participants in the room (users who have race history in this room)
      const participants = await prisma.raceHistory.findMany({
        where: {
          roomId: roomId,
        },
        select: {
          userId: true,
        },
        distinct: ["userId"],
      });

      // Filter out the leaving user
      const otherParticipants = participants
        .filter((p) => p.userId !== userId)
        .map((p) => p.userId);

      // Case: User is the admin and there are other participants
      if (room.adminId === userId && otherParticipants.length > 0) {
        // Randomly select a new admin from other participants
        const newAdminIndex = Math.floor(
          Math.random() * otherParticipants.length
        );
        const newAdminId = otherParticipants[newAdminIndex];

        // Update the room with the new admin
        await prisma.room.update({
          where: {
            id: roomId,
          },
          data: {
            adminId: newAdminId,
          },
        });

        res.status(200).json({
          success: true,
          message:
            "You have left the room. Admin rights transferred to another participant.",
        });
        return;
      }
      // Case: User is the last participant or the admin with no other participants
      else if (
        otherParticipants.length === 0 ||
        (room.adminId === userId && otherParticipants.length === 0)
      ) {
        // Delete the room and all associated races and race histories (cascading delete will handle this)
        await prisma.room.delete({
          where: {
            id: roomId,
          },
        });

        res.status(200).json({
          success: true,
          message: "You were the last participant. Room has been deleted.",
        });
        return;
      }
      // Case: Regular participant leaving
      else {
        res.status(200).json({
          success: true,
          message: "You have left the room.",
        });
        return;
      }
    } catch (error) {
      console.error("Error leaving room:", error);

      res.status(500).json({
        success: false,
        message: "Failed to leave room",
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }
);

// Deactivate a room (admin function)
