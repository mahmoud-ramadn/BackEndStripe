const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// Configure CORS
app.use(
  cors({
    origin: [
      "https://furniro-livid.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// Handle API routes that aren't caught by Vercel functions
app.get("/api/*", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
    path: req.path,
    message: "This endpoint should be handled by a Vercel serverless function",
  });
});

// Handle all other routes
app.get("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
  });
});

module.exports = app;
