const express = require("express");
const mongoose = require("mongoose");
const Order = require("../../models/order/order");
const OrderItem = require("../../models/order/orderItem");
const Shipment = require("../../models/order/shipment");
const Location = require("../../models/location");
const Branch = require("../../models/branch");

const router = express.Router();

//get All Orders
router.get("/", async (req, res) => {
  try {
    let query = {};
    if (req.query.branchId) {
      let branch = await Branch.findById(req.query.branchId);
      if (!branch) {
        return res.status(500).send("Invalid Branch ID");
      }
      await branch.populate("buildings");
      let buildingIds = branch.buildings.map((build) => build._id);
      console.log(buildingIds);
      //now getting orders of all building in that branch
      query = {
        buildingId: { $in: buildingIds },
      };
    }

    const ordersList = await Order.find(query).populate({
      path: "orderItems",
      populate: {
        path: "chemicalId",
        select: "id name unitPrice",
      },
    });
    res.status(200).send(ordersList);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Error in fetching User List from Database",
      error,
    });
  }
});

//get orders Summary
router.get("/get/ordersSummary", async (req, res) => {
  try {
    let pendingOrders = 0,
      completedOrders = 0;
    //if branch id is given than filter sensors by branch id
    if (req.query.branchId) {
      let branch = await Branch.findById(req.query.branchId);
      if (!branch) {
        return res.status(500).send("Invalid Branch ID");
      }
      await branch.populate("buildings");
      let buildingIds = branch.buildings.map((build) => build._id);
      //now counting Documents
      pendingOrders = await Order.countDocuments({
        buildingId: { $in: buildingIds },
        orderStatus: { $eq: "Pending" },
      });
      //getting total documents
      completedOrders = await Order.countDocuments({
        buildingId: { $in: buildingIds },
        orderStatus: { $eq: "Completed" },
      });
    } else {
      //return whole count of sensors
      pendingOrders = await Order.countDocuments({
        orderStatus: { $eq: "Pending" },
      });
      completedOrders = await Order.countDocuments({
        orderStatus: { $eq: "Completed" },
      });
    }
    res.status(200).send({ completedOrders, pendingOrders });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

//get Orders Summary for Chemicals
router.get("/get/orderChemicalsSummary", async (req, res) => {
  try {
    let pendingOrders = await Order.find({
      orderStatus: { $eq: "Pending" },
    }).populate({
      path: "orderItems",
      populate: {
        path: "chemicalId",
        select: "id name unitPrice",
      },
    });

    //filtering distinct chemicals names and their quantity required in all documents
    let distinctChemicals = {};
    pendingOrders.map((order) => {
      order.orderItems.map((item) => {
        distinctChemicals[item.chemicalId.name]
          ? (distinctChemicals[item.chemicalId.name] += item.quantity)
          : (distinctChemicals[item.chemicalId.name] = item.quantity);
      });
    });

    res.status(200).send(distinctChemicals);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

//get a Order by id
router.get("/:id", async (req, res) => {
  //checking if it is a valid object id
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid Object ID.",
    });
  }
  //fetch record from database
  try {
    const order = await Order.findById(req.params.id).populate({
      path: "orderItems",
      populate: {
        path: "chemicalId",
        select: "id name unitPrice",
      },
    });
    if (!order) {
      return res.status.json({
        success: false,
        message: "The order with given id not Found",
      });
    }
    res.status(200).send(order);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in Fetching Record from database.",
    });
  }
});

//delete an Order by id
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid Object ID.",
    });
  }
  //deleting record from database
  try {
    const order = await Order.findById(req.params.id).populate({
      path: "orderItems",
      populate: {
        path: "chemicalId",
        select: "id name unitPrice",
      },
    });
    if (!order) {
      return res.status(401).json({
        success: false,
        message: "order with given ID not found!",
      });
    }
    order.remove();
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

//create a new Order
router.post("/", async (req, res) => {
  try {
    //first save shipment object
    // let newShipment = await saveShipment(req);
    // console.log(newShipment);
    let savedOrder = await saveOrder(req);
    return res.status(201).send(savedOrder);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      error,
    });
  }
});

//helper functions
const saveOrder = async (req, shipmentId) => {
  console.log("save order executed");
  //first ceating a order Items objects
  let newOrderItems = await OrderItem.insertMany(req.body.orderItems);
  //now extract orderItem ids
  const orderItemsIds = newOrderItems.map((orderItem) => orderItem._id);
  // console.log(newOrderItems);

  //calculating Total Price of Order & first populate chemical object in OrderItems Objects
  newOrderItems = await Promise.all(
    newOrderItems.map((item) => item.populate("chemicalId"))
  );

  let totalPrice = 0;
  newOrderItems.map((item) => {
    totalPrice += item.chemicalId.unitPrice * item.quantity;
  });

  //now creating Order Object
  let newOrder = Order({
    orderItems: orderItemsIds,
    orderStatus: req.body.orderStatus,
    totalPrice: totalPrice,
    buildingId: req.body.buildingId,
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

module.exports = router;
