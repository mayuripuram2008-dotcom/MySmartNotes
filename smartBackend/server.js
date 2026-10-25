
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import connectDB from "./config/db.js";
import noteRoutes from "./routes/noteRoutes.js";

const app = express();

// ========================================
// ALLOWED FRONTEND DOMAINS
// ========================================
const allowedOrigins = [
  "http://localhost:5173",
  "https://my-smart-notes-lovat.vercel.app",
  "https://my-smart-notes-381jr4a8w-mayuri-4f59.vercel.app",
];

// ========================================
// CORS CONFIGURATION
// ========================================
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("CORS blocked origin:", origin);

      return callback(
        new Error(`CORS blocked origin: ${origin}`)
      );
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

// ========================================
// MIDDLEWARE
// ========================================
app.use(express.json({ limit: "10mb" }));

// ========================================
// ROOT ROUTE
// ========================================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Notes Backend is running",
  });
});

// ========================================
// HEALTH CHECK
// ========================================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is working",
  });
});

// ========================================
// NOTES CRUD API
// ========================================
app.use("/api/notes", noteRoutes);

// ========================================
// UNKNOWN ROUTE HANDLER
// ========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// ========================================
// GLOBAL ERROR HANDLER
// ========================================
app.use((err, req, res, next) => {
  console.error("Backend error:", err.message);

  if (err.message.startsWith("CORS blocked origin:")) {
    return res.status(403).json({
      success: false,
      message: "Frontend domain is not allowed by CORS",
    });
  }

  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ========================================
// SERVER PORT
// ========================================
const PORT = process.env.PORT || 5000;

// ========================================
// CONNECT DATABASE AND START SERVER
// ========================================
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("MongoDB connection initialized successfully");
      console.log(
        "Notes API: https://mysmartnotes-1.onrender.com/api/notes"
      );
      console.log(
        "Health check: https://mysmartnotes-1.onrender.com/api/health"
      );
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

