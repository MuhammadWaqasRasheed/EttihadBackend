const mongoose = require("mongoose");
const Location = require("./location");

const branchSchema = mongoose.Schema({
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
    default: "",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

branchSchema.pre("remove", async function (next) {
  try {
    //remove the location object associated with this branch
    await Location.remove({
      _id: {
        $eq: this.location,
      },
    });
  } catch (error) {
    next(error);
  }
});

branchSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

branchSchema.set("toJSON", {
  virtuals: true,
});

branchSchema.methods.toJSON = function () {
  const branch = this;
  const branchObject = branch.toObject();
  //general transformation
  branchObject["id"] = branchObject["_id"];
  delete branchObject._id;
  delete branchObject.__v;
  //also delete _id and __v from location object
  branchObject.location["id"] = branchObject.location["_id"];
  delete branchObject.location._id;
  delete branchObject.location.__v;

  return branchObject;
};

// branchSchema.virtual("buildingList", {
//   ref: "Sensor",
//   localField: "_id",
//   foreignField: "branchId",
// });

// branchSchema.virtual("buildingList").get(function () {
//   return this.buildingList.toHexString();
// });

branchSchema.virtual("buildings", {
  ref: "Building",
  localField: "_id",
  foreignField: "branchId",
});

branchSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

const Branch = mongoose.model("Branch", branchSchema);

module.exports = Branch;
