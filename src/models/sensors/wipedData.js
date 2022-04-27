const mongoose = require("mongoose");

const sensorWipedDataSchema = mongoose.Schema({
  sensorInfoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SensorInfo",
    required: true,
  },
  mean: {
    type: Number,
    required: true,
  },
  SD: {
    type: Number,
    required: true,
  },
  Variance: {
    type: Number,
    required: true,
  },
  maxValue: {
    type: Number,
    required: true,
  },
  minValue: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

sensorWipedDataSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

sensorWipedDataSchema.set("toJSON", {
  virtuals: true,
});

const category = mongoose.model("SensorWipedData", sensorWipedDataSchema);

module.exports = category;
