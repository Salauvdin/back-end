require('dotenv').config();
const express = require('express');
const app = express();
const cors = require("cors");

const router = require('./src/Router');
const { dbconnection } = require('./src/Connection');

const whitelist = [
  'http://localhost:5173',
  'http://localhost:4200',
  'http://localhost:35751'
];
// console.log("Evn :", process.env.JWT_SECRET);
// ✅ Proper CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (whitelist.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS not allowed"), false);
  },
  credentials: true
};

// 🔥 USE THIS (IMPORTANT)
app.use(cors(corsOptions));

app.use(express.json());

// routes
app.use(router);

app.get("/", (req, res) => {
  res.send("welcome");
});

// server
app.listen(3000, async (error) => {
  if (error) {
    return console.log("Server Error", error);
  }

  console.log("Server running on http://localhost:3000");
  console.log(
    "Tenant routes loaded:",
    router.stack
      .filter((layer) => layer.route?.path?.includes("tenants"))
      .map((layer) => `${Object.keys(layer.route.methods).join(",").toUpperCase()} ${layer.route.path}`)
      .join(", ")
  );

  // DB TEST
  try {
    await dbconnection.query("SELECT 1");
    console.log("DB CONNECTED SUCCESS");
  } catch (err) {
    console.log("DB ERROR:", err.message);
  }
});
