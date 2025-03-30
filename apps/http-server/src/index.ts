import express from "express";
import { UserRouter } from "./routes/user";
import { RoomRouter } from "./routes/room";

const app = express();

app.use(express.json());

app.use("/api/v1/user", UserRouter);
app.use("/api/v1/rooms", RoomRouter);
// TODO: Create router for race stats and user stats

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
