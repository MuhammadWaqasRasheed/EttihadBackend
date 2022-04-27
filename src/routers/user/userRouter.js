"Allah almighty Is Greatest Of All.";
const express = require("express");
const mongoose = require("mongoose");
const User = require("../../models/user/User");
const router = express.Router();
const bcrypt = require("bcrypt");
const auth = require("../../middlewares/auth");

//get All Users
router.get("/", auth, async (req, res) => {
  try {
    const usersList = await User.find({}).populate("buildingId");
    console.log(usersList);
    res.status(200).send(usersList);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in fetching Users data from Database",
      error,
    });
  }
});

//get currently logged in user
router.get("/me", auth, async (req, res) => {
  res.send(req.user);
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
    const user = await User.findById(req.params.id).populate("buildingId");
    if (!user) {
      return res.status.json({
        success: false,
        message: "The user with given id not Found",
      });
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in Fetching Record from database.",
    });
  }
});

//delete a User by id
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid Object ID.",
    });
  }
  //deleting record from database
  try {
    const user = await User.findById(req.params.id).populate("buildingId");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "user with given ID not found!",
      });
    }
    user.remove();
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

//create a new User
router.post("/", async (req, res) => {
  try {
    let newUser = new User({
      name: req.body.name,
      username: req.body.username,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      email: req.body.email,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      city: req.body.city,
      country: req.body.country,
      buildingId: req.body.buildingId,
    });
    newUser = await newUser.save();
    if (!newUser) {
      return res.status(400).json({
        success: false,
        message: "newUser cannot be created.",
      });
    }
    
    newUser = await User.findById(newUser._id).populate("buildingId");
    console.log(newUser);
    //generating auth token
    const token = await newUser.generateAuthToken();
    res.status(201).json({
      newUser,
      token,
    }); 
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

//login route
router.post("/login", async (req, res) => {
  try {
    let user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.status(200).json({
      user,
      token,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: "Unable To Login",
    });
  }
});

//logout
router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

//logout All
router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
