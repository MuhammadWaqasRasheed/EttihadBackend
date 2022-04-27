const express = require("express");
const mongoose = require("mongoose");
const Chemical = require("../models/chemical");
const router = express.Router();
const auth = require("../middlewares/auth");

//get all chemicals
router.get("/", auth, async (req, res) => {
  //than return all chemicals that belongs to that building branch id
  //    22
  try {
    const chemicalsList = await Chemical.find({}).populate("branchId");
    //than return only those chemicals that belongs to that branch
    if (req.query.branchId) {
      let filteredList = chemicalsList.filter((ch) => {
        return ch.buildingId.branchId._id == req.query.branchId;
      });
      return res.status(200).send(filteredList);
    }

    return res.status(200).send(chemicalsList);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in fetching chemicals list",
    });
  }
});

//get a chemical by id
router.get("/:id", auth, async (req, res) => {
  //checking if it is a valid object id
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid Object ID.",
    });
  }
  //fetch record from database
  try {
    const chemical = await Chemical.findById(req.params.id).populate(
      "branchId"
    );
    if (!chemical) {
      return res.status.json({
        success: false,
        message: "The Chemical with given id not Found",
      });
    }
    res.status(200).send(chemical);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in Fetching Record from database.",
    });
  }
});

//delete a chemical by id
router.delete("/:id", auth, async (req, res) => {
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
    const chemical = await Chemical.findById(req.params.id);
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

//create a new chemical
router.post("/", auth, async (req, res) => {
  try {
    let newChemical = new Chemical({
      name: req.body.name,
      viscosity: req.body.viscosity,
      density: req.body.density,
      unitPrice: req.body.unitPrice,
      branchId: req.body.branchId,
    });
    newChemical = await newChemical.save();
    if (!newChemical) {
      return res.status(400).json({
        success: false,
        message: "Chemical cannot be created.",
      });
    }
    res.status(201).send(newChemical);
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

//update Chemical
router.patch("/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "name",
    "viscosity",
    "density",
    "unitPrice",
    "branchId",
  ];
  const isAllowed = updates.every((update) => allowedUpdates.includes(update));
  if (!isAllowed) {
    return res.status(404).send("error : Ivalid Updates.");
  }
  try {
    const _id = req.params.id;
    const chemical = await Chemical.findOne({ _id });
    if (!chemical) {
      return res.status(404).send();
    }
    updates.forEach((update) => (chemical[update] = req.body[update]));
    await chemical.save();
    return res.status(200).send(chemical);
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
