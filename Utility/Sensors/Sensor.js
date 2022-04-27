const mongoose = require("mongoose");
const SensorRealTimeData = require("../../src/models/sensors/sensorRealTimeData");

const chalk = require("chalk");
const SaveRealtimeValue = async ({ value, sensorId }) => {
  try {
    let sensorRealTimeData = new SensorRealTimeData({
      value,
      sensorInfoId: sensorId,
    });
    sensorRealTimeData = await sensorRealTimeData.save();
    return true;
    // res.status(201).send(sensorRealTimeData);
  } catch (error) {
    console.log(error);
    return false;
  }
};
module.exports = SaveRealtimeValue;
