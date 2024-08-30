const jwt = require("jsonwebtoken");
const User_Table = require("../MODELS/userModel");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decode = jwt.verify(token, "secret");
    req.userData = decode;
    // console.log(req.userData);
    User_Table.findOne({ username: req.userData.username })
      .then((user) => {
        if (user.role !== "admin") {
          return res
            .status(403)
            .json({ message: "Access Denied: Admins Only" });
        }
        next();
      })
      .catch((err) => {
        return res
          .status(500)
          .json({ message: "Internal Server Error", error: err });
      });
  } catch (error) {
    res.status(400).json({ message: "Auth Failed" });
  }
};
