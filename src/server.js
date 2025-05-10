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

// app.use("/content", modelContentRoutes);
// app.use("/interaction", interactionRoutes);
// app.use("/chat", chatRoutes);
// app.use("/payment", paymentRoutes);

// Socket setup
global.io = new Server(server, {
  cors: {
    origin: "*",
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

global.io.on("connection", (socket) => {
  console.log("New socket connection:", socket.id);

  // Heartbeat handler
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
