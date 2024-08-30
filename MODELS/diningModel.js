const mongoose = require("mongoose");

const operationalHoursSchema = new mongoose.Schema({
  open_time: { type: Date, required: true },
  close_time: { type: Date, required: true },
  _id: false,
});

const restaurantSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone_no: { type: String, required: true },
  website: { type: String },
  operational_hours: { type: operationalHoursSchema, required: true },
  booked_slots: [
    {
      start_time: Date,
      end_time: Date,
    },
  ],
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
