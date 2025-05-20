require("dotenv").config({ path: `.env` });
require("./configs/db.js");

const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");

const {
  userRoutes,
  patientRoutes,
  doctorRoutes,
  adminRoutes,
  paymentRoutes,
} = require("./routes/index.js");

const { PORT } = require("./configs/index.js");

const app = express();
const server = http.createServer(app);

// -------------------- MIDDLEWARES --------------------
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://localhost:3001",
    "https://chshealthcare.in",
    "https://admin.chshealthcare.in"
  ],
  credentials: true,
}));

app.use(bodyParser.json({ limit: "50mb" }));
app.use("/uploads", express.static("uploads"));

// -------------------- ROUTES --------------------
app.use("/user", userRoutes);
app.use("/payment", paymentRoutes);
app.use("/patient", patientRoutes);
app.use("/doctor", doctorRoutes);
app.use("/admin", adminRoutes);

// -------------------- SOCKET.IO --------------------
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "http://localhost:3001",
      "https://chshealthcare.in",
      "https://admin.chshealthcare.in"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Make available globally if needed
global.io = io;

io.on("connection", (socket) => {
  console.log("New socket connection:", socket.id);

  socket.on("heartbeat", () => {
    socket.emit("heartbeat-ack");
  });

  socket.on("join-room", ({ userId }) => {
    if (!userId) {
      socket.emit("error", { message: "User ID is required" });
      return;
    }
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined room: user-${userId}`);
  });

  socket.on("decline-call", ({ toUserId }) => {
    if (!toUserId) {
      socket.emit("error", { message: "Recipient ID is required" });
      return;
    }
    io.to(`user-${toUserId}`).emit("call-declined");
  });

  socket.on("call-ended", ({ toUserId }) => {
    if (!toUserId) {
      socket.emit("error", { message: "Recipient ID is required" });
      return;
    }
    io.to(`user-${toUserId}`).emit("call-ended");
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
    socket.emit("error", { message: "An error occurred" });
  });

  socket.on("disconnect", (reason) => {
    console.log("User disconnected:", socket.id, "Reason:", reason);
  });
});

// -------------------- DEFAULT ROUTE --------------------
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "CHS-Health APIs are running",
  });
});

// -------------------- START SERVER --------------------
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
