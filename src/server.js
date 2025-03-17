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
  contactRoutes,
} = require("./routes/index.js");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.options("*", cors());

app.use(bodyParser.json({ limit: "50mb" }));
app.use("/uploads", express.static("uploads"));

// routes
app.use("/user", userRoutes);
app.use("/patient", patientRoutes);
app.use("/doctor", doctorRoutes);
app.use("/admin", adminRoutes);
app.use("/contact", contactRoutes);
app.use("/api", contactRoutes);

// app.use("/interaction", interactionRoutes);
// app.use("/chat", chatRoutes);
// app.use("/payment", paymentRoutes);

// Socket setup
global.io = new Server(server, {
  cors: {
    origin: "*",
  },
});

global.io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    console.log("user disconnected");
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
