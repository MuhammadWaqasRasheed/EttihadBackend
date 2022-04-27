const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  orderItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
  ],
  orderStatus: {
    type: String,
    required: true,
    trim: true,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Building",
    required: true,
  },
});

orderSchema.methods.toJSON = function () {
  const order = this;
  const orderObject = order.toObject();
  //cleaning orderItems
  if (orderObject["orderItems"]) {
    orderObject["orderItems"].map((item, index) => {
      orderObject["orderItems"][index]["id"] =
        orderObject["orderItems"][index]["_id"];
      delete orderObject["orderItems"][index]["_id"];
      delete orderObject["orderItems"][index]["__v"];
      //renae chemicalId to chemical
      orderObject["orderItems"][index]["chemical"] =
        orderObject["orderItems"][index]["chemicalId"];
      delete orderObject["orderItems"][index]["chemicalId"];
    });
  }
  //general transformation
  orderObject["id"] = orderObject["_id"];
  delete orderObject._id;
  delete orderObject.__v;
  return orderObject;
};

orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
orderSchema.set("toJSON", {
  virtuals: true,
});

const category = mongoose.model("Order", orderSchema);

module.exports = category;
