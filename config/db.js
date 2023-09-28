const mysql = require("mysql2");
require("dotenv").config();
const connectDB = mysql.createPool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
});


module.exports = connectDB.promise();
