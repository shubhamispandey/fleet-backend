import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http";
import connectDatabase from "./lib/connectDB.js";
import authRoutes from "./routes/authRoutes.js";
import meetRoutes from "./routes/meetRoutes.js";

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
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8000", // Replace with your frontend's origin
    methods: ["GET", "POST"],
  },
});

// MIDDLEWARES
app.use(cors(corsOption));
app.use(express.json());
app.use(cookieParser());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/meet", meetRoutes);

// SOCKET.IO HANDLING
io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  // Handle the socket.io join event
  socket.on("join", ({ room, user }) => {
    console.log(`${user} joined the room ${room}`);
    // Join the socket to the specified room
    socket.join(room);
    // Notify the user and broadcast to others
    socket.emit("notification", `${user}, You joined the room ${room}`);
    socket.broadcast
      .to(room)
      .emit("notification", `${user} joined the room ${room}`);
  });

  // Handle chat message
  socket.on("message", ({ room, message, user }) => {
    console.log(`message: ${message}`);
    // Broadcast the message to all users in the room
    socket.to(room).emit("message", { message, user });
  });

  // Handle WebRTC offer (sent when a user initiates a video call)
  socket.on("offer", ({ room, offer }) => {
    console.log(`Offer from ${socket.id}`);
    // Send the offer to other users in the room
    console.log(`Offer from ${socket.id} `, offer);
    socket.to(room).emit("offer", offer);
  });

  // Handle WebRTC answer (sent by the callee after receiving the offer)
  socket.on("answer", ({ room, answer }) => {
    console.log(`Answer from ${socket.id}`);
    // Send the answer to the original offerer
    socket.to(room).emit("answer", answer);
  });

  // Handle ICE candidates for establishing peer-to-peer connection
  socket.on("ice-candidate", ({ room, candidate }) => {
    console.log(`ICE candidate from ${socket.id}`);
    // Send the candidate to the other peers in the room
    socket.to(room).emit("ice-candidate", candidate);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("❌: A user disconnected");
  });
});

// Start the server
server.listen(PORT, async () => {
  console.log(`Server listening at http://localhost:${PORT}`);
  await connectDatabase(DATABASE_URL);
});
