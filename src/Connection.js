const mysql = require("mysql2");
require("dotenv").config();

const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "myproject",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

if (config.host === "localhost" || config.host === "127.0.0.1") {
  console.warn("WARNING: DB_HOST is localhost — remote hosts (Render) cannot reach localhost. Use a remote DB and set Render env variables.");
}

const dbconnection = mysql.createPool(config);

// test connection once at startup with clear logging
dbconnection.getConnection((err, conn) => {
  if (err) {
    console.error("Initial DB connection error:", err.message || err);
  } else {
    console.log("Initial DB connection successful");
    conn.release();
  }
});

// query wrapper returning promise or callback
dbconnection.query = function(query, values, callback) {
  if (typeof values === "function") { callback = values; values = undefined; }
  if (typeof callback === "function") {
    this.getConnection((err, connection) => {
      if (err) { console.error("DB Connection Error:", err.message); return callback(err); }
      connection.query(query, values, (error, results) => { connection.release(); callback(error, results); });
    });
    return;
  }
  return new Promise((resolve, reject) => {
    this.getConnection((err, connection) => {
      if (err) { console.error("DB Connection Error:", err.message); return reject(err); }
      connection.query(query, values, (error, results) => { connection.release(); if (error) reject(error); else resolve(results); });
    });
  });
};

module.exports = { dbconnection };