const mysql = require("mysql2");
require("dotenv").config();
const connectDB2 = mysql.createPool({
  host: process.env.host,
  user: process.env.user2,
  password: process.env.password,
  database: process.env.database2,
});
// console.log(process.env.host,process.env.user2,process.env.password,process.env.database2)
connectDB2.getConnection((err, connection) => {
  if (err) {
    console.error("Database2 connection failed:", err.message);
  } else {
    console.log("Database2 connected successfully!");
    connection.release();
  }
});

module.exports = connectDB2.promise();
