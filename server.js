const express = require("express");
const dbConnect = require("./src/config/dbConnect");
const initRoutes = require("./src/routes");
const cookie = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookie());
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Credentials", true);
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET,OPTIONS,PATCH,DELETE,POST,PUT"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
//   );
//   next();
// });

app.use(
  cors({
    origin: "*",
    methods: ["POST", "PUT", "GET", "DELETE", "PATCH"],
    credentials: true,
    headers: ["Content-Type"],
  })
);
app.options('*', cors())
dbConnect();
initRoutes(app);
console.log(process.env.CLIENT_URL)
app.use("/", (req, res) => {
  res.req("Server running");
});

app.listen(port, () => {
  console.log("server run at", port);
});
