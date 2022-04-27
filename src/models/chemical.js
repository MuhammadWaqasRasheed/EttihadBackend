const mongoose = require("mongoose");

const ChemicalSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  viscosity: {
    type: Number,
    required: true,
  },
  density: {
    type: Number,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
});

ChemicalSchema.pre("save", async function (next) {
  // console.log('Chemical Pre saving message..')
  next();
});

ChemicalSchema.pre("remove", async function (next) {
  // console.log('Chemical Pre Deleting message..')
  next();
});

ChemicalSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

ChemicalSchema.set("toJSON", {
  virtuals: true,
});

ChemicalSchema.methods.toJSON = function () {
  const chemical = this;
  const chemicalObject = chemical.toObject();
  //populating branch
  chemicalObject["branch"] = chemicalObject["branchId"];
  delete chemicalObject.branchId;
  // also removing _id , __v from branch
  //if branch object is populated that it will have name attribute otherwise not
  if (chemicalObject["branch"] && chemicalObject["branch"].name) {
    //if branchObject is populated than remove __id and __v from branch object also
    chemicalObject["branch"]["id"] = chemicalObject["branch"]["_id"];
    delete chemicalObject["branch"]._id;
    delete chemicalObject["branch"].__v;
  }
  //general transformation
  chemicalObject["id"] = chemicalObject["_id"];
  delete chemicalObject._id;
  delete chemicalObject.__v;
  return chemicalObject;
};

const Chemical = mongoose.model("Chemical", ChemicalSchema);

module.exports = Chemical;
