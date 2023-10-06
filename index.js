const express = require("express");
require("dotenv").config();
const route2 = require("./routes/contact");
const route = require("./routes/signup");
const bodyparser = require("body-parser");
const cors = require("cors");
const route3 = require("./routes/info");
const route4 = require("./routes/admin");

const app = express();

// Middleware
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.use(cors({
  origin: [
    "https://admin.marqueberry.com",
    "https://marqueberry.com",
    // Add other allowed origins if needed
  ],
  methods: "GET, POST, PUT, DELETE, FETCH",
  allowedHeaders: "Content-Type, Authorization",
}));

// Routes
app.use("/user", route);
app.use("/mail", route2);
app.use("/brand", route3);
app.use("/admin", route4);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
