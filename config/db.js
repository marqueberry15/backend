const mysql = require("mysql2");
require("dotenv").config();

const connectDB = mysql.createPool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
});

connectDB.getConnection((err, connection) => {
  if (err) {
    console.error("Database1 connection failed:", err.message);
  } else {
    console.log("Database1 connected successfully!");
    connection.release();
  }
});

module.exports = connectDB.promise();
