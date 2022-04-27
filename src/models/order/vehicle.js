const mongoose = require("mongoose");

const vehicleSchema = mongoose.Schema({
  vehicleNo: {
    type: String,
    required: true,
    required: true,
  },

  loadCapacity: {
    type: String,
    required: true,
    trim: true,
  },
  currentLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

vehicleSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
3;

vehicleSchema.set("toJSON", {
  virtuals: true,
});

const category = mongoose.model("Vehicle", vehicleSchema);

module.exports = category;
