const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Restaurant = require("../MODELS/diningModel");
const checkAuth = require("../MIDDLEWARE/checkAuth");
const checkAuthUser = require("../MIDDLEWARE/checkAuthUser");

router.get("/", (req, res, next) => {
  Restaurant.find()
    .select("id name address phone_no operational_hours booked_slots")
    .then((result) => {
      if (result) {
        // console.log(result);
        const transformedResult = result.map((doc) => {
          return {
            _id: doc.id,
            name: doc.name,
            phone_no: doc.phone_no,
            operational_hours: doc.operational_hours,
            booked_slots: doc.booked_slots,
          };
        });
        res.status(200).json(transformedResult);
      } else {
        res.status(404).json({ message: "No restaurants found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

router.get("/availability", (req, res, next) => {
  const place_id = req.query.id;
  const start_time = new Date(req.query.start_time);
  const end_time = new Date(req.query.end_time);

  Restaurant.findOne({ _id: place_id })
    .then((result) => {
      if (!result) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      // if (
      //   start_time.getHours() > result.operational_hours.end_time.getHours() ||
      //   start_time.getHours() < result.operational_hours.start_time.getHours()
      // ) {
      //   return res.status(200).json({ message: "Restaurant is Closed" });
      // }

      const { name, phone_no, booked_slots } = result;

      const isBooked = booked_slots.some((slot) => {
        const bookedStart = new Date(slot.start_time);
        const bookedEnd = new Date(slot.end_time);
        return start_time < bookedEnd && end_time > bookedStart;
      });
      // bug 1 -> give some gap between time and check for gapped time
      if (isBooked) {
        const lastBookedSlot = booked_slots[booked_slots.length - 1];
        const next_available_slot = new Date(
          new Date(lastBookedSlot.end_time).getTime() + 60 * 60 * 1000
        );
        res.status(200).json({
          place_id,
          name,
          phone_no,
          available: false,
          next_available_slot,
        });
      } else {
        res.status(200).json({
          place_id,
          name,
          phone_no,
          available: true,
          next_available_slot: null,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err.message });
    });
});

router.post("/book", checkAuthUser, (req, res, next) => {
  const place_id = req.body.place_id;
  const start_time = new Date(req.body.start_time);
  const end_time = new Date(req.body.end_time);

  // Validate date formats and times
  if (isNaN(start_time.getTime()) || isNaN(end_time.getTime())) {
    return res
      .status(400)
      .json({ status: "Invalid date format", status_code: 400 });
  }
  if (start_time >= end_time) {
    return res
      .status(400)
      .json({ status: "Start time must be before end time", status_code: 400 });
  }

  Restaurant.findOne({ _id: place_id })
    .then((result) => {
      if (!result) {
        return res
          .status(404)
          .json({ status: "Restaurant not found", status_code: 404 });
      }

      const isBooked = result.booked_slots.some((slot) => {
        const bookedStart = new Date(slot.start_time);
        const bookedEnd = new Date(slot.end_time);
        return start_time < bookedEnd && end_time > bookedStart;
      });

      if (isBooked) {
        return res.status(400).json({
          status:
            "Slot is not available at this moment, please try some other place",
          status_code: 400,
        });
      }

      const newBooking = {
        start_time: start_time,
        end_time: end_time,
      };
      result.booked_slots.push(newBooking);

      result
        .save()
        .then((updatedResult) => {
          res.status(200).json({
            status: "Slot booked successfully",
            status_code: 200,
            booking_id: updatedResult._id,
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            status: "Failed to book slot",
            status_code: 500,
            error: err.message,
          });
        });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .json({ status: "Server error", status_code: 500, error: err.message });
    });
});

router.post("/create", checkAuth, (req, res, next) => {
  Restaurant.findOne({ name: req.body.name }).then((doc) => {
    if (!doc) {
      const restaurant = new Restaurant({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        address: req.body.address,
        phone_no: req.body.phone_no,
        website: req.body.website,
        operational_hours: {
          open_time: req.body.operational_hours.open_time,
          close_time: req.body.operational_hours.close_time,
        },
        booked_slots: req.body.booked_slots,
      });
      restaurant
        .save()
        .then((result) => {
          res.status(200).json({
            message: result.name + " added successfully",
            place_id: result._id,
            status_code: 200,
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ error: err });
        });
    } else {
      return res.status(500).json({ message: "Restaurant Already Exist" });
    }
  });
});

router.get("/:restaurantName", (req, res, next) => {
  const name = req.params.restaurantName;
  console.log(name);
  Restaurant.findOne({ name: new RegExp(`^${name}$`, "i") })
    .then((result) => {
      if (result) {
        const rest = {
          name: result.name,
          address: result.address,
          phone_no: result.phone_no,
          website: result.website,
          operational_hours: result.operational_hours,
          booked_slots: result.booked_slots,
        };
        res.status(200).json(rest);
      } else {
        res.status(404).json({ message: "Restaurant Not Found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

// router.get("/:restaurantId", (req, res, next) => {
//   const id = req.params.restaurantId;
//   Restaurant.findOne({ _id: id })
//     .then((result) => {
//       // console.log(result);
//       const rest = {
//         name: result.name,
//         address: result.address,
//         phone_no: result.phone_no,
//         website: result.website,
//         operational_hours: result.operational_hours,
//         booked_slots: result.booked_slots,
//       };
//       res.status(200).json(rest);
//     })
//     .catch((err) => {
//       res.status(500).json({ error: err });
//     });
// });

router.patch("/:restaurantId", checkAuth, (req, res, next) => {
  const id = req.params.restaurantId;
  const updatedRestaurant = {};

  for (const ops of req.body) {
    if (ops.propName === "operational_hours") {
      const open_time = new Date(ops.value.open_time);
      const close_time = new Date(ops.value.close_time);
      if (isNaN(open_time.getTime()) || isNaN(close_time.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
      const updated_time_slots = { open_time, close_time };
      updatedRestaurant[ops.propName] = updated_time_slots;
    } else {
      updatedRestaurant[ops.propName] = ops.value;
    }
  }

  Restaurant.findByIdAndUpdate(id, { $set: updatedRestaurant }, { new: true })
    .then((result) => {
      if (result) {
        res.status(200).json({ message: "Restaurant Updated", data: result });
      } else {
        res.status(404).json({ message: "Restaurant not found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.delete("/:restaurantId", checkAuth, (req, res, next) => {
  const id = req.params.restaurantId;
  Restaurant.deleteOne({ _id: id })
    .then((result) => {
      if (result) {
        res.status(200).json({ message: "Restaurant Deleted" });
      } else {
        res.status(500).json({ message: "Restaurant Not present" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

module.exports = router;
