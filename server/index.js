const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./mongodb/connect.js');
const dalleRoutes = require('./routes/dalleRoutes.js');
const authRoutes = require('./routes/authRoutes.js'); // 1. AUTH ROUTES IMPORT KIYA

const app = express();

// Middleware
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/v1/dalle', dalleRoutes);
app.use('/api/v1/auth', authRoutes); // 2. AUTH ROUTES KO USE KIYA

// Base Route
app.get('/', async (req, res) => {
  res.status(200).send('Hello from Visionary AI!');
});

// Server Start Logic
const startServer = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URL;

    if (!mongoUrl) {
      console.error("ERROR: MONGODB_URL is missing in .env file!");
      return;
    }

    console.log("Connecting to MongoDB...");
    await connectDB(mongoUrl);
    console.log("MongoDB Connected Successfully!");

    app.listen(8080, () => {
      console.log('Server is running on: http://localhost:8080');
    });

  } catch (error) {
    console.error("SERVER ERROR:");
    console.error(error.message);
  }
};

startServer();