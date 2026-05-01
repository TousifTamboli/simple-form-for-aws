const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const userRoute = require("./routes/userRoute");

const app = express();
const PORT = process.env.PORT || 5001;

// Security
app.use(helmet());

// CORS (minimal)
app.use(cors());

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoute);

app.get("/", (req, res) => {
  res.send("API is working");
});

// Env validation
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not defined");
  process.exit(1);
}

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`[SERVER] Running on port ${PORT}`);
});






// development level

// const allowedOrigins = [
//   process.env.CLIENT_URL,
//   "http://localhost:5173",
//   "http://127.0.0.1:5173",
//   "http://localhost"
// ].filter(Boolean);

// app.use(
//   cors({
//     origin(origin, callback) {
//       // Allow browser requests from known frontend origins and non-browser tools.
//       if (!origin || allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       }

//       return callback(new Error(`CORS blocked for origin: ${origin}`));
//     },
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

