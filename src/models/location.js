const mongoose = require("mongoose");

const locationSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: "",
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

locationSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

locationSchema.set("toJSON", {
  virtuals: true,
});

locationSchema.methods.toJSON = function () {
  console.log("location JSON");
  const location = this;
  const locationObject = location.toObject();
  //general transformation
  locationObject["id"] = locationObject["_id"];
  delete locationObject._id;
  delete locationObject.__v;
  return locationObject;
};

const Location = mongoose.model("Location", locationSchema);

module.exports = Location;
