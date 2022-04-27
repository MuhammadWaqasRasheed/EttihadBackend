const express = require("express");
const mongoose = require("mongoose");
const Shipment = require("../../models/order/shipment");
const TransporterItem = require("../../models/order/transportItem");
const Location = require("../../models/location");

const router = express.Router();

//get All Orders
router.get("/", async (req, res) => {
  try {
    const shipmentsList = await Shipment.find({});
    res.status(200).send(shipmentsList);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in fetching User List from Database",
      error,
    });
  }
});

//get a Shipment object by id
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
    const shipment = await Shipment.findById(req.params.id).populate({
      path: "transporters targetLocation orderId",
    });
    if (!shipment) {
      return res.status.json({
        success: false,
        message: "The shipment with given id not Found",
      });
    }
    res.status(200).send(shipment);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in Fetching Record from database.",
    });
  }
});

//delete a Shipment object by id
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid Object ID.",
    });
  }
  //deleting record from database
  try {
    const shipment = await Shipment.findById(req.params.id).populate({
      path: "transporters targetLocation orderId",
    });
    if (!shipment) {
      return res.status(401).json({
        success: false,
        message: "shipment with given ID not found!",
      });
    }
    shipment.remove();
    res.status(200).json({
      success: true,
      shipment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

//create a new Shipment
router.post("/", async (req, res) => {
  try {
    let savedShipment = await saveShipment(req.body);
    return res.status(201).send(savedShipment);
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

module.exports = router;

//helper method to save shipment object
const saveShipment = async (shipment) => {
  //first creating a Location object for target location
  let targetLocation = Location({
    name: shipment.targetlocation.name,
    latitude: shipment.targetlocation.latitude,
    longitude: shipment.targetlocation.longitude,
  });
  targetLocation = await targetLocation.save();

  //now creating transporters objects
  let transporters = await Promise.all(
    shipment.transporters.map(async (item) => {
      let transporterItem = TransporterItem({
        vehicleId: item.vehicleId,
        employeeId: item.employeeId,
      });
      transporterItem = await transporterItem.save();
      return transporterItem._id;
    })
  );

  //now creating shipment object
  let newshipment = Shipment({
    targetLocation: targetLocation._id,
    transporters: transporters,
    orderId: shipment.orderId,
  });
  newshipment = await newshipment.save();
  return Shipment.findById(newshipment._id).populate({
    path: "transporters targetLocation orderId",
  });
};
