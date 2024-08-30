const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User_Table = require("../MODELS/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/signup", (req, res, next) => {
  if (req.body.role === "admin") {
    if (req.body.adminKey !== "ADMIN-ONLY") {
      return res.status(403).json({ message: "Invalid admin key" });
    }
  }
  User_Table.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(409).json({ message: "USER ALREADY EXIST" });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(409).json({ error: err });
          } else {
            const user = new User_Table({
              _id: new mongoose.Types.ObjectId(),
              username: req.body.username,
              email: req.body.email,
              password: hash,
              role: req.body.role,
            });
            user
              .save()
              .then((result) => {
                console.log(result);
                res.status(200).json({
                  status: "Account successfully created",
                  status_code: 200,
                  user_id: result._id,
                  role: result.role,
                });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({ error: err });
              });
          }
        });
      }
    })
    .catch();
});

router.post("/login", (req, res, next) => {
  User_Table.findOne({ username: req.body.username })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          status: "Incorrect username/password provided. Please retry",
          status_code: 401,
        });
      }
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          return res.status(401).json({
            status: "Incorrect username/password provided. Please retry",
            status_code: 401,
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              username: user.username,
              email: user.email,
              userId: user._id,
            },
            "secret",
            {
              expiresIn: "1h",
            }
          );
          return res.status(200).json({
            status: "Login successful",
            status_code: 200,
            user_id: user._id,
            access_token: token,
          });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
