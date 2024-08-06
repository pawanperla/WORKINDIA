import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql2";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = 3000;

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "2000",
  database: "WORKINDIA",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.stack);
    return;
  }
  console.log("Connected to MySQL as id", connection.threadId);
});

app.post("/api/signup", (req, res) => {
  const { user_name, password, email } = req.body;

  connection.query(
    `SELECT * FROM user_data WHERE email = ?`,
    [email],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          status: "Error",
          status_Code: 500,
          message: "Database query error",
        });
      }

      if (results.length > 0) {
        return res.status(409).json({
          status: "Error",
          status_Code: 409,
          message: "Email already exists",
        });
      }

      connection.query(
        "INSERT INTO user_data (user_name, password, email) VALUES (?, ?, ?)",
        [user_name, password, email],
        (err, result) => {
          if (err) {
            return res.status(500).json({
              status: "Error",
              status_Code: 500,
              message: "Database insertion error",
            });
          }

          res.status(201).json({
            status: "Account created successfully",
            status_Code: 201,
            user_id: result.insertId,
          });
        }
      );
    }
  );
});

app.post("/api/login", (req, res) => {
  const { user_name, password } = req.body;
  connection.query(
    `SELECT * FROM user_data WHERE user_name = ? AND password = ?`,
    [user_name, password],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          status: "Error",
          status_Code: 500,
          message: "Database query error",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          status: "Incorrect username/password provided. Please retry",
          status_code: 401,
        });
      }

      res.status(200).json({
        status: "Login Successful",
        status_code: 200,
        user_id: results[0].user_id,
        access_token: "eyJhbGci0iJIjsjdsa",
      });
    }
  );
});

app.post("/api/dining-place/create", (req, res) => {
  const { name, address, phone_no, website, operational_hours } = req.body;

  const data = {
    name,
    address,
    phone_no,
    website,
    operational_hours: JSON.stringify(operational_hours),
  };

  connection.query("INSERT INTO dining_places SET ?", data, (err, result) => {
    if (err) {
      return res.status(500).json({
        status: "Error",
        status_Code: 500,
        message: "Database insertion error",
      });
    }

    res.status(201).json({
      status: "Dining place added successfully",
      status_Code: 201,
      place_id: result.insertId,
    });
  });
});

app.get("/api/dining-place", (req, res) => {
  const { name } = req.query;
  connection.query(
    `SELECT * FROM dining_places WHERE name LIKE ?`,
    [`%${name}%`],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          status: "Error",
          status_Code: 500,
          message: "Database query error",
        });
      }

      res.status(200).json(results);
    }
  );
});

app.get("/api/dining-place/availability", (req, res) => {
  const { place_id, start_time, end_time } = req.query;

  connection.query(
    `SELECT booked_slots FROM dining_places WHERE id = ?`,
    [place_id],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          status: "Error",
          status_Code: 500,
          message: "Database query error",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          status: "Dining place not found",
          status_code: 404,
        });
      }

      const bookedSlots = JSON.parse(results[0].booked_slots);
      const isAvailable = bookedSlots.every(
        (slot) =>
          !(
            new Date(slot.start_time) < new Date(end_time) &&
            new Date(slot.end_time) > new Date(start_time)
          )
      );

      const nextAvailableSlot =
        bookedSlots.find(
          (slot) => new Date(slot.end_time) >= new Date(end_time)
        )?.end_time || null;

      res.status(200).json({
        place_id: place_id,
        available: isAvailable,
        next_available_slot: isAvailable ? null : nextAvailableSlot,
      });
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`);
});
