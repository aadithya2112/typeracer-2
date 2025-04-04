import express from "express";
import { UserRouter } from "./routes/user";
import { RoomRouter } from "./routes/room";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1/user", UserRouter);
app.use("/api/v1/rooms", RoomRouter);
// TODO: Create router for race stats and user stats, last 10 race history, last 10 practice sesssions

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
