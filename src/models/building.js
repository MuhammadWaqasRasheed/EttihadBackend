const mongoose = require("mongoose");

const buildingSchema = mongoose.Schema({
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
  name: {
    type: String,
    trim: true,
    default: "",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

buildingSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

buildingSchema.set("toJSON", {
  virtuals: true,
});

buildingSchema.methods.toJSON = function () {
  const building = this;
  const buildingObject = building.toObject();
  //general transformation
  buildingObject["id"] = buildingObject["_id"];
  delete buildingObject._id;
  delete buildingObject.__v;
  //rename branchId to branch
  buildingObject["branch"] = buildingObject["branchId"];
  delete buildingObject["branchId"];
  //also delete _id and __v from branch object
  buildingObject.branch["id"] = buildingObject.branch["_id"];
  delete buildingObject.branch._id;
  delete buildingObject.branch.__v;
  return buildingObject;
};

const Building = mongoose.model("Building", buildingSchema);

module.exports = Building;
