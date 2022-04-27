const express = require("express");
const mongoose = require("mongoose");
const SensorType = require("../../models/sensors/sensorType");
const router = express.Router();

//get All Types
router.get("/", async (req, res) => {
  try {
    const sensorTypeList = await SensorType.find({});
    res.status(200).send(sensorTypeList);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in fetching Sensors data from Database",
      error,
    });
  }
});

//get a sensorType by id
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
    const sensorType = await SensorType.findById(req.params.id);
    if (!sensorType) {
      return res.status.json({
        success: false,
        message: "The sensorType with given id not Found",
      });
    }
    res.status(200).send(sensorType);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in Fetching Record from database.",
    });
  }
});

//delete a sensorType by id
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid Object ID.",
    });
  }
  //deleting record from database
  try {
    //if i call findByIdAndDelete() than it will not trigger remove middleware on our sensorType schema
    // const sensorType = await sensorType.findByIdAndDelete(req.params.id);
    const sensorType = await SensorType.findById(req.params.id);
    if (!sensorType) {
      return res.status(401).json({
        success: false,
        message: "sensorType with given ID not found!",
      });
    }
    sensorType.remove();
    res.status(200).json({
      success: true,
      sensorType,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

//create a new SensorType
router.post("/", async (req, res) => {
  try {
    let sensorType = new SensorType({
      name: req.body.name,
    });
    sensorType = await sensorType.save();
    if (!sensorType) {
      return res.status(400).json({
        success: false,
        message: "SensorType cannot be created.",
      });
    }
    res.status(201).send(sensorType);
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

module.exports = router;
