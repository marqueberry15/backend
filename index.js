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
const connectDB = require("./config/db");
const route6 = require("./routes/app");


// var admin = require("firebase-admin");


// const { getMessaging } = require("firebase-admin/messaging");


// const serviceAccount= require("./public/adoro-3079a-firebase-adminsdk-n856c-6416d7a366.json")
// console.log(process.env.FIREBASE_SERVICE_ACCOUNT_KEY,'keeeeeeeeeeeeeee')
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
// console.log(serviceAccount,'rrefdsss')

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

app.use(bodyparser.json({ limit: "100mb", extended: true }));
app.use(bodyparser.urlencoded({ limit: "100mb", extended: true }));
app.use(cors({
  origin: "*",
  methods: "GET, POST, PUT, DELETE, FETCH",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
}));
app.use(express.static(path.resolve(__dirname, "public")));

app.use("/user", route);
app.use("/mail", route2);
app.use("/brand", route3);
app.use("/admin", route4);
app.use("/app/user", route6);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
