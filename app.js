const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// require routes
const userRoutes = require("./API/users");
const diningRoutes = require("./API/dining");

// conect to mongoDB
mongoose.connect(
  "mongodb+srv://pawan25:test1234@cluster1.6bsqh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1"
);

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api/dining-place", diningRoutes);
app.use("/api", userRoutes);

app.use((req, res, next) => {
  console.log("Connected and Listening");
  res.status(200).json({ message: "Connected and Listening" });
});

module.exports = app;
