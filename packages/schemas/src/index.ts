import z from "zod";

// model User {
//     id        String   @id @default(uuid())
//     name      String?
//     email     String   @unique
//     password  String
//     createdAt DateTime @default(now())
//     updatedAt DateTime @updatedAt

//     raceHistories    RaceHistory[]
//     practiceSessions Practice[]
//   }

export const UserSchema = z.object({
  name: z.string().nullable(),
  email: z.string().email(),
  password: z.string(),
  updatedAt: z.date().optional(),
});

//   model Room {
//     id        String   @id @default(uuid())
//     name      String   @unique
//     isActive  Boolean  @default(true)
//     createdAt DateTime @default(now())

//     races       Race[]
//     RaceHistory RaceHistory[]
//   }

export const RoomSchema = z.object({
  name: z.string().min(3, "Room name must be at least 3 characters long"),
  isActive: z.boolean().default(true),
  isPrivate: z.boolean().default(false),
  password: z.string().optional(),
});

//   model Race {
//     id        String    @id @default(uuid())
//     roomId    String
//     room      Room      @relation(fields: [roomId], references: [id], onDelete: Cascade)
//     startTime DateTime  @default(now())
//     endTime   DateTime?
//     createdAt DateTime  @default(now())

//     raceHistories RaceHistory[]
//   }

export const RaceSchema = z.object({
  roomId: z.string(),
  startTime: z.date().default(new Date()),
  endTime: z.date().nullable(),
  textContent: z.string(),
});

export const JoinRoomSchema = z.object({
  roomId: z.string(),
  password: z.string().optional(),
});

export const CreateRaceSchema = z.object({
  roomId: z.string().uuid(),
  textContent: z.string().optional(),
});

//   model RaceHistory {
//     id        String   @id @default(uuid())
//     raceId    String
//     race      Race     @relation(fields: [raceId], references: [id], onDelete: Cascade)
//     userId    String
//     user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
//     roomId    String
//     room      Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
//     wpm       Int // Words per minute
//     accuracy  Float // Accuracy percentage
//     raceTime  Int // Time taken in seconds
//     createdAt DateTime @default(now())
//     updatedAt DateTime @updatedAt
//   }

// export const RaceHistorySchema = z.object({
//   raceId: z.string(),
//   userId: z.string(),
//   roomId: z.string(),
//   wpm: z.number(),
//   accuracy: z.number(),
//   raceTime: z.number(),
//   updatedAt: z.date().optional(),
// });

//   model Practice {
//     id        String   @id @default(uuid())
//     userId    String
//     user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
//     wpm       Int
//     accuracy  Float
//     duration  Int // Duration in seconds
//     createdAt DateTime @default(now())
//   }
