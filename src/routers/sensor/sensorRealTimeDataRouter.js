const express = require("express");
const mongoose = require("mongoose");
const SensorType = require("../../models/sensors/sensorType");
const SensorRealTimeData = require("../../models/sensors/sensorRealTimeData");
const router = express.Router();

//get All Sensors real time data
//tasks?limit=2&skip=2
router.get("/", async (req, res) => {
  try {
    let sensorRealTimeDataList;
    if (req.query.limit && req.query.skip) {
      let skip = req.query.skip;
      let limit = req.query.limit;
      sensorRealTimeDataList = await SensorRealTimeData.find({})
        .skip(skip)
        .limit(limit);
    } else {
      sensorRealTimeDataList = await SensorRealTimeData.find({});
    }

    res.status(200).send(sensorRealTimeDataList);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in fetching Sensors Real time list from Database",
      error,
    });
  }
});

//get All Sensors real time data
router.get("/get/count", async (req, res) => {
  try {
    filter = {};
    //if sensor Id is given than filter accorign to sensor ID
    if (req.query.sensorId) {
      filter["sensorInfoId"] = req.query.sensorId;
    }
    console.log(filter);
    const valuesCount = await SensorRealTimeData.countDocuments(filter);
    if (!valuesCount) {
      res.status(500).json({ success: false });
    }
    res.status(200).send({ documentCount: valuesCount });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in fetching Sensors Real time list from Database",
      error,
    });
  }
});

//getting documnt count
router.get("/get/count", async (req, res) => {
  const productCount = await Product.countDocuments();
  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.status(200).send({ productCount });
});

/*we can use this route in two ways  
  1)if query param is not give than given id with route is considered as an object id SensorRealTimeData table and a single object will be sent back
  2)if query data is give and matchSensorId='true' than given id will be considered as a sensor id and an array all the values relaetd to that sensor will be returned
*/
router.get("/:id", async (req, res) => {
  //checking if it is a valid object id
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid Object ID.",
    });
  }
  //this value is true than return id with this route is a sensor id
  //and we will return array of values of that particular sensor
  try {
    if (req.query.matchSensorId) {
      const sensorRealTimeData = await SensorRealTimeData.find({
        sensorInfoId: req.params.id,
      });
      if (!sensorRealTimeData) {
        return res.status.json({
          success: false,
          message: "The sensorRealTimeData with given sensor id not Found",
        });
      }
      res.status(200).send(sensorRealTimeData);
    } else {
      //else return reltime value of given id(realtime value id)
      const sensorRealTimeData = await SensorRealTimeData.findById(
        req.params.id
      );
      if (!sensorRealTimeData) {
        return res.status.json({
          success: false,
          message: "The sensorRealTimeData with given id not Found",
        });
      }
      res.status(200).send(sensorRealTimeData);
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
      const sensorRealTimeData = await SensorRealTimeData.findById(
        req.params.id
      );
      if (!sensorRealTimeData) {
        return res.status(401).json({
          success: false,
          message: "sensorRealTimeData with given ID not found!",
        });
      }
      await sensorRealTimeData.remove();
      res.status(200).json({
        success: true,
        sensorRealTimeData,
      });
    } //else delete all values related to a particular sensor
    else {
      const sensorRealTimeData = await SensorRealTimeData.deleteMany({
        sensorInfoId: req.params.id,
      });
      if (!sensorRealTimeData) {
        return res.status.json({
          success: false,
          message: "The sensorRealTimeData with given sensor id not Found",
        });
      }
      // await sensorRealTimeData.remove();
      res.status(200).send(sensorRealTimeData);
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

//create a new Sensor Realtime value
router.post("/", async (req, res) => {
  try {
    let sensorRealTimeData = new SensorRealTimeData({
      value: req.body.value,
      sensorInfoId: req.body.sensorInfoId,
    });
    sensorRealTimeData = await sensorRealTimeData.save();
    if (!sensorRealTimeData) {
      return res.status(400).json({
        success: false,
        message: "sensorRealTimeData cannot be created.",
      });
    }
    res.status(201).send(sensorRealTimeData);
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

module.exports = router;
