const express = require("express");
const cors = require("cors");
const path = require("path");

const attemptRoutes = require("./routes/attempt.routes");
const eventRoutes = require("./routes/event.routes");

const app = express();

// Middleware
app.use(cors(
  {
    origin:"*",
    method:["GET","POST"]
  }
));
app.use(express.json());

// API routes
app.use("/attempt", attemptRoutes);
app.use("/events", eventRoutes);

// ✅ Employer Dashboard (STATIC)
app.use(
  "/employer",
  express.static(path.join(__dirname, "dashboard"))
);

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running");
});

module.exports = app;
