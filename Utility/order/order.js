const mongoose = require("mongoose");
const Order = require("../../src/models/order/order");
const OrderItem = require("../../src/models/order/orderItem");

const chalk = require("chalk");

//helper functions
const saveOrder = async (order) => {
  console.log(chalk.inverse.blue("called"));
  //first ceating a order Items objects
  let newOrderItems = await OrderItem.insertMany(order.orderItems);

  //now extract orderItem ids
  const orderItemsIds = newOrderItems.map((orderItem) => orderItem._id);
  // console.log(newOrderItems);

  //calculating Total Price of Order & first populate chemical object in OrderItems Objects
  newOrderItems = await Promise.all(
    newOrderItems.map((item) => item.populate("chemicalId"))
    // newOrderItems.map((item) => console.log(item))
  );

  let totalPrice = 0;
  newOrderItems.map((item) => {
    totalPrice += item.chemicalId.unitPrice * item.quantity;
  });

  //now creating Order Object
  let newOrder = Order({
    orderItems: orderItemsIds,
    orderStatus: order.orderStatus,
    totalPrice: totalPrice,
    buildingId: order.buildingId,
  });
  // console.log(newOrder);
  newOrder = await newOrder.save();

  return Order.findById(newOrder._id).populate({
    path: "orderItems",
    populate: {
      path: "chemicalId",
      select: "id name unitPrice",
    },
  });
};

module.exports = saveOrder;
