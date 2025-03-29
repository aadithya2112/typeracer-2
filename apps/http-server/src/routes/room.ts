import { Router, Request, Response } from "express";
import { prisma } from "@repo/db/client";
import { RoomSchema, JoinRoomSchema } from "@repo/schemas/schemas";
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

// // Join a room
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

      // Get active race in the room or create one if none exists
      let activeRace = await prisma.race.findFirst({
        where: {
          roomId: room.id,
          endTime: null,
        },
      });

      if (!activeRace) {
        // Create a sample text for racing (in production, you'd have a proper text selection)
        const sampleText =
          "The quick brown fox jumps over the lazy dog. This is a sample text for typing race.";

        // Create a new race
        activeRace = await prisma.race.create({
          data: {
            roomId: room.id,
            textContent: sampleText,
          },
        });
      }

      res.status(200).json({
        success: true,
        data: {
          room: {
            id: room.id,
            name: room.name,
            isPrivate: room.isPrivate,
          },
          race: {
            id: activeRace.id,
            startTime: activeRace.startTime,
            textContent: activeRace.textContent,
          },
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

// // Leave a room
// RoomRouter.post("/leave/:raceId", authMiddleware, async (req: Request, res: Response) => {
//   try {
//     const { raceId } = req.params;
//     const { wpm, accuracy, raceTime } = req.body;

//     // Check if the race exists
//     const race = await prisma.race.findUnique({
//       where: {
//         id: raceId,
//       },
//       include: {
//         room: true,
//       },
//     });

//     if (!race) {
//       return res.status(404).json({
//         success: false,
//         message: "Race not found",
//       });
//     }

//     // Record the race history
//     if (wpm && accuracy && raceTime) {
//       await prisma.raceHistory.create({
//         data: {
//           raceId: race.id,
//           userId: req.user.id,
//           roomId: race.roomId,
//           wpm: parseInt(wpm),
//           accuracy: parseFloat(accuracy),
//           raceTime: parseInt(raceTime),
//         },
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Successfully left room",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to leave room",
//       error: error.message,
//     });
//   }
// });

// // Deactivate a room (admin function)
// RoomRouter.put("/:id/deactivate", authMiddleware, async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     // Check if room exists and user is admin
//     const room = await prisma.room.findUnique({
//       where: {
//         id,
//       },
//     });

//     if (!room) {
//       return res.status(404).json({
//         success: false,
//         message: "Room not found",
//       });
//     }

//     // Verify if the user is the admin of the room
//     if (room.adminId !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: "Only room admin can deactivate the room",
//       });
//     }

//     // End any active races in the room
//     await prisma.race.updateMany({
//       where: {
//         roomId: id,
//         endTime: null,
//       },
//       data: {
//         endTime: new Date(),
//       },
//     });

//     // Deactivate the room
//     const updatedRoom = await prisma.room.update({
//       where: {
//         id,
//       },
//       data: {
//         isActive: false,
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       data: {
//         id: updatedRoom.id,
//         name: updatedRoom.name,
//         isActive: updatedRoom.isActive,
//       },
//       message: "Room deactivated successfully",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to deactivate room",
//       error: error.message,
//     });
//   }
// });
