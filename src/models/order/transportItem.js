const mongoose = require("mongoose");

const transportItemSchema = mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

transportItemSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
3;

transportItemSchema.set("toJSON", {
  virtuals: true,
});

const category = mongoose.model("TransportItem", transportItemSchema);

module.exports = category;
