const mongoose = require("mongoose");

const sensorTypeSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

sensorTypeSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

sensorTypeSchema.set("toJSON", {
  virtuals: true,
});

const category = mongoose.model("SensorType", sensorTypeSchema);

module.exports = category;
