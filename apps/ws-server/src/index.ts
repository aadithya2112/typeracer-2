import { prisma } from "@repo/db/client";
import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;

// Define message types for WebSocket communication
enum MessageType {
  AUTHENTICATE = "authenticate",
  JOIN_ROOM = "join_room",
  LEAVE_ROOM = "leave_room",
  USER_JOINED = "user_joined",
  USER_LEFT = "user_left",
  ERROR = "error",
  START_RACE = "start_race", // New: To start a race
  RACE_STARTED = "race_started", // New: Notify clients race is starting
  RACE_PROGRESS = "race_progress", // New: Update race progress
  RACE_FINISHED = "race_finished", // New: Race has ended
}

interface WebSocketMessage {
  type: MessageType;
  payload: any;
}

interface AuthenticatedClient extends WebSocket {
  userId?: string;
  username?: string;
  roomId?: string;
  isAuthenticated: boolean;
}

interface RaceParticipant {
  userId: string;
  username: string;
  progress: number; // 0-100 percent
  wpm: number;
  accuracy: number;
  position?: number;
  finishTime?: Date;
}

interface ActiveRace {
  raceId: string;
  roomId: string;
  participants: Map<string, RaceParticipant>;
  startTime: Date;
  textContent: string;
  isActive: boolean;
}

function verify(token: string, secret: string) {
  return jwt.verify(token, secret);
}
const config = {
  jwtSecret: JWT_SECRET,
};

// Initialize WebSocket server
const wss = new WebSocketServer({ port: 8080 });

// Track room participants and active races
const roomParticipants = new Map<string, Set<AuthenticatedClient>>(); // roomId -> Set of WebSocket clients
const activeRaces = new Map<string, ActiveRace>(); // raceId -> ActiveRace

// Helper function to broadcast to all clients in a room
function broadcastToRoom(
  roomId: string,
  message: WebSocketMessage,
  excludeClient?: AuthenticatedClient
) {
  if (!roomParticipants.has(roomId)) return;

  roomParticipants.get(roomId)?.forEach((client) => {
    if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Handle new WebSocket connections
wss.on("connection", (ws: AuthenticatedClient) => {
  console.log("New client connected");
  ws.isAuthenticated = false;

  // Handle client messages
  ws.on("message", async (message: string) => {
    try {
      const data: WebSocketMessage = JSON.parse(message);
      console.log("Received message:", data);
      // Handle authentication first
      if (data.type === MessageType.AUTHENTICATE) {
        const { token } = data.payload;
        console.log("Received token:", token);
        try {
          // Verify JWT token
          const decoded: any = verify(token, config.jwtSecret);
          ws.userId = decoded.userId;
          ws.username = decoded.email || "Anonymous";
          ws.isAuthenticated = true;

          ws.send(
            JSON.stringify({
              type: MessageType.AUTHENTICATE,
              payload: {
                success: true,
                userId: ws.userId,
                username: ws.username,
              },
            })
          );

          console.log(`User authenticated: ${ws.userId} (${ws.username})`);
        } catch (error) {
          ws.send(
            JSON.stringify({
              type: MessageType.ERROR,
              payload: {
                message: "Authentication failed",
                code: "AUTH_FAILED",
              },
            })
          );
        }
        return;
      }

      // All other message types require authentication
      if (!ws.isAuthenticated) {
        ws.send(
          JSON.stringify({
            type: MessageType.ERROR,
            payload: {
              message: "Not authenticated",
              code: "NOT_AUTHENTICATED",
            },
          })
        );
        return;
      }

      // Handle different message types
      switch (data.type) {
        case MessageType.JOIN_ROOM: {
          const { roomId } = data.payload;

          // Check if room exists
          const room = await prisma.room.findUnique({
            where: { id: roomId, isActive: true },
            include: { admin: { select: { id: true, name: true } } },
          });

          if (!room) {
            ws.send(
              JSON.stringify({
                type: MessageType.ERROR,
                payload: { message: "Room not found", code: "ROOM_NOT_FOUND" },
              })
            );
            return;
          }

          // Leave current room if in one
          if (ws.roomId && roomParticipants.has(ws.roomId)) {
            roomParticipants.get(ws.roomId)?.delete(ws);

            // Notify others that user left
            broadcastToRoom(ws.roomId, {
              type: MessageType.USER_LEFT,
              payload: { userId: ws.userId, username: ws.username },
            });
          }

          // Join new room
          ws.roomId = roomId;
          if (!roomParticipants.has(roomId)) {
            roomParticipants.set(roomId, new Set());
          }
          roomParticipants.get(roomId)?.add(ws);

          // Get active race info if exists
          const activeRace = await prisma.race.findFirst({
            where: { roomId, isActive: true },
          });

          // Get current participants in the room
          const participants = Array.from(
            roomParticipants.get(roomId) || []
          ).map((client) => ({
            userId: client.userId,
            username: client.username,
          }));

          // Send room info to the client
          ws.send(
            JSON.stringify({
              type: MessageType.JOIN_ROOM,
              payload: {
                room: {
                  id: room.id,
                  name: room.name,
                  isPrivate: room.isPrivate,
                  admin: room.admin,
                  hasActiveRace: !!activeRace,
                },
                participants,
                race: activeRace
                  ? {
                      id: activeRace.id,
                      startTime: activeRace.startTime,
                      textContent: activeRace.textContent,
                      participants: activeRace
                        ? Array.from(
                            (
                              activeRaces.get(activeRace.id)?.participants ||
                              new Map()
                            ).values()
                          )
                        : [],
                    }
                  : null,
              },
            })
          );

          // Notify others that a new user joined
          broadcastToRoom(
            roomId,
            {
              type: MessageType.USER_JOINED,
              payload: { userId: ws.userId, username: ws.username },
            },
            ws
          );

          // If there's an active race, add user to participants
          if (activeRace && activeRaces.has(activeRace.id)) {
            const race = activeRaces.get(activeRace.id)!;
            if (!race.participants.has(ws.userId!)) {
              race.participants.set(ws.userId!, {
                userId: ws.userId!,
                username: ws.username!,
                progress: 0,
                wpm: 0,
                accuracy: 100,
              });
            }
          }

          break;
        }

        case MessageType.LEAVE_ROOM: {
          if (!ws.roomId) return;

          // Remove from room participants
          if (roomParticipants.has(ws.roomId)) {
            roomParticipants.get(ws.roomId)?.delete(ws);

            // Notify others that user left
            broadcastToRoom(ws.roomId, {
              type: MessageType.USER_LEFT,
              payload: { userId: ws.userId, username: ws.username },
            });

            // If room is empty, clean up
            if (roomParticipants.get(ws.roomId)?.size === 0) {
              roomParticipants.delete(ws.roomId);
            }
          }

          // Remove from active race if part of one
          const activeRace = await prisma.race.findFirst({
            where: { roomId: ws.roomId, isActive: true },
          });

          if (activeRace && activeRaces.has(activeRace.id)) {
            activeRaces.get(activeRace.id)?.participants.delete(ws.userId!);
          }

          ws.roomId = undefined;

          ws.send(
            JSON.stringify({
              type: MessageType.LEAVE_ROOM,
              payload: { success: true },
            })
          );

          break;
        }

        case MessageType.START_RACE: {
          if (!ws.roomId) {
            ws.send(
              JSON.stringify({
                type: MessageType.ERROR,
                payload: { message: "Not in a room", code: "NOT_IN_ROOM" },
              })
            );
            return;
          }

          // Check if user is admin of the room
          const room = await prisma.room.findUnique({
            where: { id: ws.roomId },
          });

          if (!room || room.adminId !== ws.userId) {
            ws.send(
              JSON.stringify({
                type: MessageType.ERROR,
                payload: {
                  message: "Only room admin can start a race",
                  code: "NOT_ADMIN",
                },
              })
            );
            return;
          }

          // Check if there's already an active race
          const existingRace = await prisma.race.findFirst({
            where: { roomId: ws.roomId, isActive: true },
          });

          if (existingRace) {
            ws.send(
              JSON.stringify({
                type: MessageType.ERROR,
                payload: {
                  message: "Race already in progress",
                  code: "RACE_IN_PROGRESS",
                },
              })
            );
            return;
          }

          // Create a countdown timer for race start (10 seconds)
          const countdownSeconds = 10;
          const startTime = new Date(Date.now() + countdownSeconds * 1000);
          const { textContent } = data.payload;

          // Create race in database
          const race = await prisma.race.create({
            data: {
              roomId: ws.roomId,
              startTime,
              textContent:
                textContent ||
                "The quick brown fox jumps over the lazy dog. This is a sample text for typing race.",
              isActive: true,
            },
          });

          // Create active race tracking
          activeRaces.set(race.id, {
            raceId: race.id,
            roomId: ws.roomId,
            participants: new Map(),
            startTime,
            textContent: race.textContent,
            isActive: true,
          });

          // Add all room participants to the race
          roomParticipants.get(ws.roomId)?.forEach((client) => {
            activeRaces.get(race.id)?.participants.set(client.userId!, {
              userId: client.userId!,
              username: client.username!,
              progress: 0,
              wpm: 0,
              accuracy: 100,
            });
          });

          // Notify all clients about race start countdown
          broadcastToRoom(ws.roomId, {
            type: MessageType.RACE_STARTED,
            payload: {
              raceId: race.id,
              startTime,
              textContent: race.textContent,
              countdownSeconds,
            },
          });

          // Schedule race to automatically end after a timeout (e.g., 5 minutes)
          setTimeout(
            async () => {
              const raceInfo = activeRaces.get(race.id);
              if (raceInfo && raceInfo.isActive) {
                raceInfo.isActive = false;

                // Update race in database
                await prisma.race.update({
                  where: { id: race.id },
                  data: { isActive: false, endTime: new Date() },
                });

                // Notify all participants about race end
                broadcastToRoom(raceInfo.roomId, {
                  type: MessageType.RACE_FINISHED,
                  payload: {
                    raceId: race.id,
                    results: Array.from(raceInfo.participants.values())
                      .sort((a, b) => (b.progress || 0) - (a.progress || 0))
                      .map((p, index) => ({ ...p, position: index + 1 })),
                  },
                });

                // Remove race from active races
                activeRaces.delete(race.id);
              }
            },
            5 * 60 * 1000
          ); // 5 minutes timeout

          break;
        }

        case MessageType.RACE_PROGRESS: {
          if (!ws.roomId) {
            ws.send(
              JSON.stringify({
                type: MessageType.ERROR,
                payload: { message: "Not in a room", code: "NOT_IN_ROOM" },
              })
            );
            return;
          }

          const { raceId, progress, wpm, accuracy, isFinished } = data.payload;

          // Check if race exists and is active
          if (!activeRaces.has(raceId)) {
            ws.send(
              JSON.stringify({
                type: MessageType.ERROR,
                payload: {
                  message: "Race not found or inactive",
                  code: "RACE_NOT_FOUND",
                },
              })
            );
            return;
          }

          const race = activeRaces.get(raceId)!;

          if (!race.isActive) {
            ws.send(
              JSON.stringify({
                type: MessageType.ERROR,
                payload: {
                  message: "Race not active",
                  code: "RACE_NOT_ACTIVE",
                },
              })
            );
            return;
          }

          // Update participant progress
          if (race.participants.has(ws.userId!)) {
            const participant = race.participants.get(ws.userId!)!;
            participant.progress = progress;
            participant.wpm = wpm;
            participant.accuracy = accuracy;

            // If user has finished
            if (isFinished && !participant.finishTime) {
              participant.finishTime = new Date();

              // Calculate position based on finish order
              const finishedParticipants = Array.from(
                race.participants.values()
              )
                .filter((p) => p.finishTime)
                .sort(
                  (a, b) =>
                    (a.finishTime?.getTime() || 0) -
                    (b.finishTime?.getTime() || 0)
                );

              participant.position = finishedParticipants.length;

              // Calculate race time in seconds (from race start to finish)
              const raceTimeMs =
                participant.finishTime.getTime() - race.startTime.getTime();
              const raceTimeSeconds = Math.floor(raceTimeMs / 1000);

              // Save race history to DB
              await prisma.raceHistory.create({
                data: {
                  userId: ws.userId!,
                  raceId,
                  roomId: ws.roomId,
                  wpm: parseInt(wpm),
                  accuracy: parseInt(accuracy),
                  raceTime: raceTimeSeconds,
                  createdAt: new Date(),
                },
              });

              // Check if all participants finished or if only one participant remains active
              const activeParticipants = Array.from(
                race.participants.values()
              ).filter((p) => !p.finishTime && p.progress > 0);

              // End race if all active participants have finished
              if (activeParticipants.length === 0) {
                // End race
                race.isActive = false;

                // Update race in database
                await prisma.race.update({
                  where: { id: raceId },
                  data: { isActive: false, endTime: new Date() },
                });

                // Notify all participants about race end
                broadcastToRoom(race.roomId, {
                  type: MessageType.RACE_FINISHED,
                  payload: {
                    raceId: race.raceId,
                    results: Array.from(race.participants.values())
                      .filter((p) => p.finishTime) // Only include finishers in results
                      .sort(
                        (a, b) => (a.position || 9999) - (b.position || 9999)
                      ),
                  },
                });

                // Remove race from active races
                activeRaces.delete(raceId);
              }
            }
          }

          // Broadcast progress to all participants
          broadcastToRoom(ws.roomId, {
            type: MessageType.RACE_PROGRESS,
            payload: {
              raceId,
              participants: Array.from(race.participants.values()),
            },
          });

          break;
        }
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
      ws.send(
        JSON.stringify({
          type: MessageType.ERROR,
          payload: {
            message: "Invalid message format",
            code: "INVALID_FORMAT",
          },
        })
      );
    }
  });

  // Handle client disconnection
  ws.on("close", async () => {
    console.log("Client disconnected");

    // Handle leaving room if in one
    if (ws.roomId && roomParticipants.has(ws.roomId)) {
      roomParticipants.get(ws.roomId)?.delete(ws);

      // Notify others that user left
      broadcastToRoom(ws.roomId, {
        type: MessageType.USER_LEFT,
        payload: { userId: ws.userId, username: ws.username },
      });

      // If room is empty, clean up
      if (roomParticipants.get(ws.roomId)?.size === 0) {
        roomParticipants.delete(ws.roomId);
      }

      // Remove from active race if part of one
      if (ws.userId) {
        for (const [raceId, race] of activeRaces.entries()) {
          if (race.roomId === ws.roomId && race.participants.has(ws.userId)) {
            race.participants.delete(ws.userId);
            break;
          }
        }
      }
    }
  });
});

// Cleanup inactive connections and races regularly
setInterval(() => {
  // Clean up inactive races
  const now = new Date();
  for (const [raceId, race] of activeRaces.entries()) {
    // If race started more than 10 minutes ago and is still active, end it
    if (
      now.getTime() - race.startTime.getTime() > 10 * 60 * 1000 &&
      race.isActive
    ) {
      race.isActive = false;

      // Update race in database
      prisma.race
        .update({
          where: { id: raceId },
          data: { isActive: false, endTime: now },
        })
        .catch(console.error);

      // Notify all participants about race end
      broadcastToRoom(race.roomId, {
        type: MessageType.RACE_FINISHED,
        payload: {
          raceId,
          results: Array.from(race.participants.values())
            .sort((a, b) => (b.progress || 0) - (a.progress || 0))
            .map((p, index) => ({ ...p, position: index + 1 })),
        },
      });

      // Remove race from active races
      activeRaces.delete(raceId);
    }
  }
}, 60 * 1000); // Run every minute

console.log("WebSocket server running on port 8080");

export { wss };
