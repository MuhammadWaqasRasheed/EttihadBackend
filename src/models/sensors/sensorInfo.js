const mongoose = require("mongoose");

const sensorInfoSchema = mongoose.Schema({
  minVal: {
    type: Number,
    required: true,
  },
  maxVal: {
    type: Number,
    required: true,
  },
  thresholdValue: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  chemicalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chemical",
    required: true,
  },
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Building",
    required: true,
  },
  // sensorTypeId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "SensorType",
  //   required: true,
  // },
  date: {
    type: Date,
    default: Date.now,
  },
});

sensorInfoSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

sensorInfoSchema.set("toJSON", {
  virtuals: true,
});

sensorInfoSchema.methods.toJSON = function () {
  const sensorInfo = this;
  const sensorInfoObject = sensorInfo.toObject();
  //populating chemical
  sensorInfoObject["chemical"] = sensorInfoObject["chemicalId"];
  delete sensorInfoObject.chemicalId;
  // also removing _id , __v from branch
  //if chemical object is populated that it will have name attribute otherwise not
  if (sensorInfoObject["chemical"].name) {
    //if branchObject is populated than remove __id and __v from branch object also
    sensorInfoObject["chemical"]["id"] = sensorInfoObject["chemical"]["_id"];
    delete sensorInfoObject["chemical"]._id;
    delete sensorInfoObject["chemical"].__v;
  }

  //populating building
  sensorInfoObject["building"] = sensorInfoObject["buildingId"];
  delete sensorInfoObject.buildingId;
  // also removing _id , __v from branch
  //if chemical object is populated that it will have name attribute otherwise not
  if (sensorInfoObject["building"].name) {
    //if branchObject is populated than remove __id and __v from branch object also
    sensorInfoObject["building"]["id"] = sensorInfoObject["building"]["_id"];
    delete sensorInfoObject["building"]._id;
    delete sensorInfoObject["building"].__v;
  }
  //general transformation
  sensorInfoObject["id"] = sensorInfoObject["_id"];
  delete sensorInfoObject._id;
  delete sensorInfoObject.__v;
  return sensorInfoObject;
};

const category = mongoose.model("SensorInfo", sensorInfoSchema);

module.exports = category;
