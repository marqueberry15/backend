const mysql = require("mysql2");
require("dotenv").config();
const connectDB2 = mysql.createPool({
  host: process.env.host,
  user: process.env.user2,
  password: process.env.password,
  database: process.env.database2,
});
// console.log(process.env.host,process.env.user2,process.env.password,process.env.database2)


module.exports = connectDB2.promise();
