import { prisma } from "@repo/db/client";
import { UserSchema } from "@repo/schemas/schemas";
import express from "express";

const app = express();

app.use(express.json());

console.log("Hi from http server");
