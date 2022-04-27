const mongoose = require("mongoose");

const sensorRealTimeDataSchema = mongoose.Schema({
  sensorInfoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SensorInfo",
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

sensorRealTimeDataSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

sensorRealTimeDataSchema.set("toJSON", {
  virtuals: true,
});

const category = mongoose.model("SensorRealTimeData", sensorRealTimeDataSchema);

module.exports = category;
