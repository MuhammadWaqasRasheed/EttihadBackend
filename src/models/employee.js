const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  DOB: {
    type: Date,
    default: Date.now,
  },
  contactNo: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
3;

userSchema.set("toJSON", {
  virtuals: true,
});

const Employee = mongoose.model("Employee", userSchema);

module.exports = Employee;
