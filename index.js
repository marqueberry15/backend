const express = require("express");
require("dotenv").config();
const route2 = require("./routes/contact");
const route = require("./routes/signup");
const bodyparser = require("body-parser");
const cors = require("cors");
const route3 = require("./routes/info");
const route4 = require("./routes/admin");
const path = require("path");
const app = express();
const route6 = require("./routes/app");
app.use(bodyparser.json({ limit: "100mb", extended: true }));
app.use(bodyparser.urlencoded({ limit: "100mb", extended: true }));
app.use(
  cors({
    origin: "*",
    methods: "GET, POST, PUT, DELETE, FETCH",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
  })
);
app.use(express.static(path.resolve(__dirname, "public")));
app.use("/user", route);
app.use("/mail", route2);
app.use("/brand", route3);
app.use("/admin", route4);
app.get("/hello", (req, res) => {
  res.send({
    user: {
      name: "sushma",
    },
  });
});
app.use("/app/user", route6);
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
