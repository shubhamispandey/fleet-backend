import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDatabase from "./lib/connectDB.js";
import authRoutes from "./routes/authRoutes.js";

// ENVIRONMENT VARIABLES
dotenv.config();
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

// CORS POLICY
const corsOption = {
  origin: process.env.FRONTEND_HOST,
  credentials: true,
  optionsSuccessStatus: 200,
};

const app = express();
app.use(cors(corsOption));

// JSON MIDDLEWARE
app.use(express.json());

// COOKIE MIDDLEWARE
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.listen(PORT, async () => {
  console.log(`Server listening at http://localhost:${PORT}`);
  await connectDatabase(DATABASE_URL);
});
