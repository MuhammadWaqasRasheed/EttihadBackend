const mongoose = require("mongoose");
const TransportItem = require("./transportItem");

const shipmentSchema = mongoose.Schema({
  transporters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TransportItem",
      required: true,
    },
  ],
  targetLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
});

shipmentSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

shipmentSchema.set("toJSON", {
  virtuals: true,
});

const category = mongoose.model("Shipment", shipmentSchema);

module.exports = category;
