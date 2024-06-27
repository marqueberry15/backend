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


const { initializeApp, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");


app.use(bodyparser.json({ limit: "100mb", extended: true }));
app.use(bodyparser.urlencoded({ limit: "100mb", extended: true }));
app.use(cors({
  origin: "*",
  methods: "GET, POST, PUT, DELETE, FETCH",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
}));
app.use(express.static(path.resolve(__dirname, "public")));

const serviceAccount = require("./public/adoro-3079a-firebase-adminsdk-n856c-5112757dc9.json");


initializeApp({
  credential: cert(serviceAccount),
  projectId: 'adoro-3079a',
});




app.use("/user", route);
app.use("/mail", route2);
app.use("/brand", route3);
app.use("/admin", route4);
app.use("/app/user", route6);

const PORT = process.env.PORT || 8000;

app.post("/send", function (req, res) {
  const registrationToken = 'dfl97H9VTeuzdzwquLsL76:APA91bErEZ9V79-hl5pRv4twZmCdjYKnZcPe7n15B6l25FB21Tp9mO-Hpf5Qqjs3jsZHRswJrze2GlChQ3k1ZJSOWKR7xOzTtmb2wPk4wW0gOpzZi6KNcOM62dmkqiYoNke-97eQzh1h';

  const message = {
    notification: {
      title: 'Pareeeee',
      body: 'heoo world',
    },
    token: registrationToken,
  };

  getMessaging().send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
      res.status(200).send('Successfully sent message: ' + response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
      res.status(500).send('Error sending message: ' + error);
    });
});

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
