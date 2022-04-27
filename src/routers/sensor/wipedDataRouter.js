const express = require("express");
const mongoose = require("mongoose");
const WipedData = require("../../models/sensors/wipedData");
const router = express.Router();

//get All Sensors WipedData
router.get("/", async (req, res) => {
  try {
    const wipedDataList = await WipedData.find({});
    res.status(200).send(wipedDataList);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in fetching Sensors data from Database",
      error,
    });
  }
});

/*we can use this route in two ways  
  1)if query param is not give than given id with route is considered as an object id wiped table and a single object will be sent back
  2)if query data is give and matchSensorId='true' than given id will be considered as a sensor id and an array of all the values related to that sensor will be returned
*/
router.get("/:id", async (req, res) => {
  //checking if it is a valid object id
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid Object ID.",
    });
  }
  try {
    //if this value is true than return id with this route is a sensor id
    //and we will return array of values of that particular sensor
    if (req.query.matchSensorId) {
      const sensorsWipedData = await WipedData.find({
        sensorInfoId: req.params.id,
      });
      if (!sensorsWipedData) {
        return res.status.json({
          success: false,
          message: "The sensorsWipedData with given sensor id not Found",
        });
      }
      res.status(200).send(sensorsWipedData);
    } else {
      //else return wiped data of given id(wipred data object id)
      const sensorWipedData = await WipedData.findById(req.params.id);
      if (!sensorWipedData) {
        return res.status.json({
          success: false,
          message: "The sensorWipedData with given id not Found",
        });
      }
      res.status(200).send(sensorWipedData);
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in Fetching Record from database.",
    });
  }
});

/*we can use this route in two ways  
  1)if query param is not give than given id with route is considered as an object id SensorRealTimeData table and a single object will be deleted 
  2)if query data is give and matchSensorId='true' than given id will be considered as a sensor id and all the values relaetd to that sensor will be deleted
*/
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid Object ID.",
    });
  }
  try {
    //delete a single value from database
    if (!req.query.matchSensorId) {
      const sensorWipedData = await WipedData.findById(req.params.id);
      if (!sensorWipedData) {
        return res.status(401).json({
          success: false,
          message: "sensorWipedData with given ID not found!",
        });
      }
      await sensorWipedData.remove();
      res.status(200).json({
        success: true,
        sensorWipedData,
      });
    } //else delete all values related to a particular sensor
    else {
      const sensorWipedData = await WipedData.deleteMany({
        sensorInfoId: req.params.id,
      });
      if (!sensorWipedData) {
        return res.status.json({
          success: false,
          message: "The sensorWipedData with given sensor id not Found",
        });
      }
      // await sensorWipedData.remove();
      res.status(200).send(sensorWipedData);
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

//create a new WipedData object
router.post("/", async (req, res) => {
  try {
    let wipedData = new WipedData({
      sensorInfoId: req.body.sensorInfoId,
      mean: req.body.mean,
      SD: req.body.SD,
      Variance: req.body.Variance,
      maxValue: req.body.maxValue,
      minValue: req.body.minValue,
    });
    wipedData = await wipedData.save();
    if (!wipedData) {
      return res.status(400).json({
        success: false,
        message: "wipedData cannot be created.",
      });
    }
    res.status(201).send(wipedData);
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

module.exports = router;
