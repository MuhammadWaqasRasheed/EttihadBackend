const express = require("express");
const mongoose = require("mongoose");
const Chemical = require("../../models/chemical");
const SensorInfo = require("../../models/sensors/sensorInfo");
const Branch = require("../../models/branch");
const router = express.Router();
const auth = require("../../middlewares/auth");

//get All SensorsInfo
router.get("/", auth, async (req, res) => {
  try {
    let sensorInfoList = await SensorInfo.find({})
      .populate("chemicalId")
      .populate("buildingId");

    //than filter it accordingly
    if (req.query.branchId) {
      sensorInfoList = sensorInfoList.filter((sensor) => {
        return sensor.buildingId.branchId == req.query.branchId;
      });
    }
    res.status(200).send(sensorInfoList);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in fetching Sensors data from Database",
      error,
    });
  }
});

//get all sensors count
router.get("/get/count", auth, async (req, res) => {
  try {
    let sensorCount = 0;
    //if branch id is given than filter sensors by branch id
    if (req.query.branchId) {
      let branch = await Branch.findById(req.query.branchId);
      if (!branch) {
        return res.status(500).send("Invalid Branch ID");
      }
      await branch.populate("buildings");
      let buildingIds = branch.buildings.map((build) => build._id);
      //now counting Documents
      sensorCount = await SensorInfo.countDocuments({
        buildingId: { $in: buildingIds },
      });
    } else {
      //return whole count of sensors
      sensorCount = await SensorInfo.countDocuments();
    }
    res.status(200).send({ count: sensorCount });
  } catch (error) {}
});

//get a SensorInfo by id
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
    const sensorInfo = await SensorInfo.findById(req.params.id)
      .populate("chemicalId")
      .populate("buildingId");
    if (!sensorInfo) {
      return res.status.json({
        success: false,
        message: "The sensorInfo with given id not Found",
      });
    }
    res.status(200).send(sensorInfo);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in Fetching Record from database.",
    });
  }
});

//delete a chemical by id
router.delete("/:id", auth, async (req, res) => {
  console.log("yes");

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid Object ID.",
    });
  }
  //deleting record from database
  try {
    //if i call findByIdAndDelete() than it will not trigger remove middleware on our Chemical schema
    // const chemical = await Chemical.findByIdAndDelete(req.params.id);
    const chemical = await SensorInfo.findById(req.params.id)
      .populate("chemicalId")
      .populate("buildingId");
    if (!chemical) {
      return res
        .status(401)
        .json({ success: false, message: "Chemical with given ID not found!" });
    }
    chemical.remove();
    res.status(200).json({
      success: true,
      chemical,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

//create a new SensorInfo
router.post("/", async (req, res) => {
  try {
    let sensorInfo = new SensorInfo({
      minVal: req.body.minVal,
      maxVal: req.body.maxVal,
      thresholdValue: req.body.thresholdValue,
      name: req.body.name,
      chemicalId: req.body.chemicalId,
      buildingId: req.body.buildingId,
      // sensorTypeId: req.body.sensorTypeId,
    });
    sensorInfo = await sensorInfo.save();
    sensorInfo = await SensorInfo.findById(sensorInfo._id)
      .populate("chemicalId")
      .populate("buildingId");
    if (!sensorInfo) {
      return res.status(400).json({
        success: false,
        message: "SensorInfo cannot be created.",
      });
    }
    res.status(201).send(sensorInfo);
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

//update SesnorInfo
router.patch("/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "minVal",
    "maxVal",
    "thresholdValue",
    "name",
    "chemicalId",
    "buildingId",
  ];
  const isAllowed = updates.every((update) => allowedUpdates.includes(update));
  if (!isAllowed) {
    return res.status(404).send("error : Invalid Updates.");
  }
  try {
    const _id = req.params.id;
    let sensor = await SensorInfo.findOne({ _id });
    if (!sensor) {
      return res.status(404).send();
    }

    updates.forEach((key) => {
      sensor[key] = req.body[key];
    });
    //saving objects
    await sensor.save();

    return res.status(200).send(sensor);
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;
