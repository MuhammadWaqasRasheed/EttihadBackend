const express = require("express");
const mongoose = require("mongoose");
const Vehicle = require("../../models/order/vehicle");
const Location = require("../../models/location");
const router = express.Router();

//get All Vehicles
router.get("/", async (req, res) => {
  try {
    const vehiclesList = await Vehicle.find({}).populate("currentLocation");
    res.status(200).send(vehiclesList);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in fetching User List from Database",
      error,
    });
  }
});

//get a Vehicle by id
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
    const vehicle = await Vehicle.findById(req.params.id).populate(
      "currentLocation"
    );
    if (!vehicle) {
      return res.status.json({
        success: false,
        message: "The vehicle with given id not Found",
      });
    }
    res.status(200).send(vehicle);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in Fetching Record from database.",
    });
  }
});

//delete an Vehicle by id
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid Object ID.",
    });
  }
  //deleting record from database
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate(
      "currentLocation"
    );
    if (!vehicle) {
      return res.status(401).json({
        success: false,
        message: "vehicle with given ID not found!",
      });
    }
    vehicle.remove();
    res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

//create a new Vehicle
router.post("/", async (req, res) => {
  try {
    //first ceating a location object
    let newLocation = Location({
      name: req.body.locationName,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    });
    newLocation = await newLocation.save();
    console.log(newLocation);
    // now creating new branch
    let newVehicle = Vehicle({
      currentLocation: newLocation._id,
      vehicleNo: req.body.vehicleNo,
      loadCapacity: req.body.loadCapacity,
    });
    newVehicle = await newVehicle.save();
    newVehicle = await Vehicle.findById(newVehicle._id).populate(
      "currentLocation"
    );
    return res.status(201).send(newVehicle);
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

module.exports = router;
