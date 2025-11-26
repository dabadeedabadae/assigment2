import express from "express";
import cors from "cors";
import pkg from "@prisma/client";


process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/postgres";

const app = express();
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "E-Commerce API is running" });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
