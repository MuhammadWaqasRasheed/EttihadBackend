const mongoose = require("mongoose");

const orderItemSchema = mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
  },
  chemicalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chemical",
    required: true,
  },
});

const OrderItem = mongoose.model("OrderItem", orderItemSchema);

module.exports = OrderItem;
