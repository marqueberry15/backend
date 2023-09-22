const express = require("express");
require("dotenv").config();
const route2 = require("./routes/contact");
const app = express();
const route = require("./routes/signup");
const bodyparser = require("body-parser");
const cors = require("cors");
const route3 = require("./routes/info");
app.use(express.json({ extended: true }));
const path = require("path");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
// const connectFTP = require("./config//ftp");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, FETCH");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
  app.use(express.static(path.resolve(__dirname, "public")));
});

app.use(
  cors({
    origin: "*",
  })
);

const PORT = process.env.PORT || 8000;

app.use("/user", route);
app.use("/mail", route2);
app.use("/brand", route3);

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
