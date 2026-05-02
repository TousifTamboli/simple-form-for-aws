const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const userRoute = require("./routes/userRoute");

const app = express();
const PORT = process.env.PORT || 5001;

// Disable fingerprinting
app.disable("x-powered-by");

// Security headers
app.use(helmet());

// CORS setup
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost",
].filter(Boolean);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// app.use(
//   cors({
//     origin(origin, callback) {
//       // Allow requests with no origin (like Postman, curl)
//       if (!origin) return callback(null, true);

//       if (allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       }

//       console.warn(`🚫 CORS blocked: ${origin}`);
//       return callback(null, false); // do NOT throw error
//     },
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//   })
// );

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoute);

// Root route
app.get("/", (req, res) => {
  res.send("API is working");
});

// Health check (useful for Docker / AWS)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.stack);

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal Server Error",
  });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("🛑 MongoDB connection closed");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
});

// Start server AFTER DB connection
async function startServer() {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is not defined");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
}

startServer();