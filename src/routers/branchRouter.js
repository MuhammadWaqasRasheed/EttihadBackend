const express = require("express");
const mongoose = require("mongoose");
const Branch = require("../models/branch");
const Location = require("../models/location");
const Chemical = require("../models/chemical");
const router = express.Router();
const auth = require("../middlewares/auth");

//get all Branches
router.get("/", async (req, res) => {
  try {
    const branchList = await Branch.find({}).populate("location");
    res.status(200).send(branchList);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in fetching branch list",
    });
  }
});

//get a branch by id
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
    const branch = await Branch.findById(req.params.id).populate("location");
    if (!branch) {
      return res.status.json({
        success: false,
        message: "The Branch with given id not Found",
      });
    }
    res.status(200).send(branch);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in Fetching Record from database.",
    });
  }
});

//delete a branch by id
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid Object ID.",
    });
  }
  //deleting record from database
  try {
    const branch = await Branch.findById(req.params.id).populate("location");
    if (!branch) {
      return res
        .status(401)
        .json({ success: false, message: "Branch not found!" });
    }
    //removing it from database
    branch.remove();
    res.status(200).json({
      success: true,
      branch,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

//create a new Branch
router.post("/", async (req, res) => {
  try {
    //first ceating a location object
    let newLocation = Location({
      name: req.body.locationName,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    });
    newLocation = await newLocation.save();
    //now creating new branch
    let newBranch = Branch({
      location: newLocation._id,
      name: req.body.branchName,
    });
    newBranch = await newBranch.save();
    newBranch = await Branch.findById(newBranch._id).populate("location");
    return res.status(201).send(newBranch);
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

//update Branch
router.patch("/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "branchName",
    "locationName",
    "latitude",
    "longitude",
  ];
  const isAllowed = updates.every((update) => allowedUpdates.includes(update));
  if (!isAllowed) {
    return res.status(404).send("error : Invalid Updates.");
  }
  try {
    const _id = req.params.id;
    let branch = await Branch.findOne({ _id }).populate("location");
    let location = await Location.findById(branch.location._id);
    if (!branch || !location) {
      return res.status(404).send();
    }

    branch["name"] = req.body["branchName"];
    location["name"] = req.body["locationName"];
    location["latitude"] = req.body["latitude"];
    location["longitude"] = req.body["longitude"];

    //saving objects
    await location.save();
    await branch.save();
    return res.status(200).send(branch);
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;

// creating a chemical
// router.get("/is", async (req, res) => {
//   try {
//     let newChemical = Chemical({
//       name: "HCL",
//       viscosity: 25,
//       density: 25,
//       unitPrice: 10,
//     });
//     newChemical = await newChemical.save();
//     res.status(201).send(newChemical);
//   } catch (error) {
//     console.log("Error in creaing Chemical");
//     res.status.send("Error in creating newChemical");
//   }
// });

// router.get("/createBranch", async (req, res) => {
//   try {
//     //getting location object
//     let location = await Location.findById("61f04ae905997eb1b01197df");
//     //creating branch object
//     let newBranch = Branch({});
//     console.log(location);
//     res.status(201).send("fetched successfully.");
//   } catch (error) {
//     res.status(201).send("fetching error.");
//   }
// });
