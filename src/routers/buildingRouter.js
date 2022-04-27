const express = require("express");
const mongoose = require("mongoose");
const Branch = require("../models/branch");
const Building = require("../models/building");
const router = express.Router();

//get all Buildings
router.get("/", async (req, res) => {
  try {
    const buildingList = await Building.find({}).populate("branchId");
    res.status(200).send(buildingList);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in fetching Buildings list",
    });
  }
});

//get a Building by id
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
    const building = await Building.findById(req.params.id).populate(
      "branchId"
    );
    if (!building) {
      return res.status.json({
        success: false,
        message: "The building with given id not Found",
      });
    }

    res.status(200).send(building);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in Fetching Record from database.",
    });
  }
});

//delete a Building by id
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid Object ID.",
    });
  }
  //deleting record from database
  try {
    const building = await Building.findByIdAndDelete(req.params.id).populate(
      "branchId"
    );
    if (!building) {
      return res
        .status(401)
        .json({ success: false, message: "Building not found!" });
    }
    res.status(200).json({
      success: true,
      building,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

//create a new Building
router.post("/", async (req, res) => {
  try {
    let newBuilding = Building({
      branchId: req.body.branchId,
      name: req.body.name,
    });
    newBuilding = await newBuilding.save();
    newBuilding = await Building.findById(newBuilding._id).populate("branchId");

    return res.status(201).send(newBuilding);
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

//update Branch
router.patch("/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["branchId", "name"];
  const isAllowed = updates.every((update) => allowedUpdates.includes(update));
  if (!isAllowed) {
    return res.status(404).send("error : Invalid Updates.");
  }

  try {
    const _id = req.params.id;
    let building = await Building.findOne({ _id }).populate("branchId");
    if (!building) {
      return res.status(404).json({
        success: false,
        error: "Building does not exists against this ID",
      });
    }
    //updating object
    updates.forEach((key) => {
      building[key] = req.body[key];
    });
    //saving objects
    building = await building.save();
    return res.status(200).send("test");
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;
