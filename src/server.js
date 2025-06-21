require("dotenv").config({ path: `.env` });
require("./configs/db.js");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const { PORT } = require("./configs/index.js");
const {
  userRoutes,
  patientRoutes,
  doctorRoutes,
  adminRoutes,
  paymentRoutes,
  ordersRoutes,
} = require("./routes/index.js");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.options("*", cors());

app.use(bodyParser.json({ limit: "50mb" }));
app.use("/uploads", express.static("uploads"));

// routes
app.use("/user", userRoutes);
app.use("/payment", paymentRoutes);
app.use("/patient", patientRoutes);
app.use("/doctor", doctorRoutes);
app.use("/admin", adminRoutes);
app.use("/orders", ordersRoutes);

// app.use("/interaction", interactionRoutes);
// app.use("/chat", chatRoutes);
// app.use("/payment", paymentRoutes);

// Socket setup
global.io = new Server(server, {
  cors: {
    origin: [
      "https://api.chshealthcare.in",
      "https://chshealthcare.in",
      "http://localhost:3000",
      "http://localhost:5000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["my-custom-header"],
  },
  transports: ["websocket", "polling"], // Enable both transports
  pingTimeout: 60000,
  pingInterval: 25000,
});

global.io.on("connect_error", (err) => {
  console.error("Socket connection error:", err.message);
});

global.io.on("connection", (socket) => {
  console.log("New socket connection:", socket.id);

  // Store user mapping for better tracking
  socket.userId = null;

  // Heartbeat handler
  socket.on("heartbeat", () => {
    socket.emit("heartbeat-ack");
  });

  socket.on("join-room", ({ userId }) => {
    try {
      if (!userId) {
        console.warn("Join-room: User ID is missing");
        socket.emit("error", { message: "User ID is required" });
        return;
      }

      console.log(`User ${userId} attempting to join room with socket ${socket.id}`);

      // Store userId in socket for reference
      socket.userId = userId;
      
      // Leave any existing rooms first
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          console.log(`Leaving room: ${room}`);
          socket.leave(room);
        }
      });

      // Join the user's specific room
      const userRoom = `user-${userId}`;
      socket.join(userRoom);
      console.log(`User ${userId} joined room: ${userRoom}`);
      
      // Log all rooms for debugging
      console.log(`Socket ${socket.id} is now in rooms:`, Array.from(socket.rooms));
      
      // Verify room joining
      setTimeout(() => {
        const roomSockets = global.io.sockets.adapter.rooms.get(userRoom);
        console.log(`Room verification for ${userRoom}:`, {
          roomExists: !!roomSockets,
          socketCount: roomSockets ? roomSockets.size : 0,
          socketIds: roomSockets ? Array.from(roomSockets) : []
        });
      }, 500);
    } catch (error) {
      console.error("Error in join-room:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  socket.on("decline-call", ({ toUserId }) => {
    try {
      console.log("Decline-call event received:", { fromUserId: socket.userId, toUserId });
      
      if (!toUserId) {
        console.warn("Decline-call: Recipient ID is missing");
        socket.emit("error", { message: "Recipient ID is required" });
        return;
      }

      console.log(`Call declined from ${socket.userId} to ${toUserId}`);
      // Target specific user instead of broadcasting
      global.io.to(`user-${toUserId}`).emit("call-declined");
    } catch (error) {
      console.error("Error in decline-call:", error);
      socket.emit("error", { message: "Failed to decline call" });
    }
  });

  socket.on("call-end", ({ toUserId }) => {
    try {
      console.log("Call-end event received:", { fromUserId: socket.userId, toUserId });
      
      if (toUserId) {
        console.log(`Call ended from ${socket.userId} to ${toUserId}`);
        // Target specific user
        global.io.to(`user-${toUserId}`).emit("call-ended");
      } else {
        console.log(`Call ended broadcast from ${socket.userId} (no specific recipient)`);
        // Broadcast to all if no specific user
        global.io.emit("call-ended");
      }
    } catch (error) {
      console.error("Error in call-end:", error);
      socket.emit("error", { message: "Failed to end call" });
    }
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
    socket.emit("error", { message: "An error occurred" });
  });

  socket.on("disconnect", (reason) => {
    console.log("User disconnected:", socket.id, "User ID:", socket.userId, "Reason:", reason);
  });
});

// Add monitoring for debugging
setInterval(() => {
  const rooms = global.io.sockets.adapter.rooms;
  const activeRooms = Array.from(rooms.keys()).filter(room => room !== 'undefined');
  console.log("=== Socket Monitoring ===");
  console.log("Active rooms:", activeRooms);
  console.log("Total connected clients:", global.io.engine.clientsCount);
  
  // Log details for each room
  activeRooms.forEach(room => {
    const roomSockets = rooms.get(room);
    console.log(`Room ${room}: ${roomSockets.size} sockets`);
  });
  console.log("========================");
}, 30000); // Log every 30 seconds

// testing router
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "CHS-Health apis is running",
  });
});

try {
  server.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
  });
} catch (error) {
  console.error("Error starting the server:", error);
}
