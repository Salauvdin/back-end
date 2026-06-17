const mysql = require("mysql2");
require("dotenv").config();

const dbconnection = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  port: process.env.DB_PORT || 3306,
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "myproject",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// connection test for startup logs
dbconnection.getConnection((err, conn) => {
  if (err) {
    console.error("Initial DB connection error:", err.message || err);
  } else {
    console.log("Initial DB connection successful");
    conn.release();
  }
});

// Add query method to pool
dbconnection.query = function(query, values, callback) {
  // ...existing query wrapper...
};

module.exports = { dbconnection };