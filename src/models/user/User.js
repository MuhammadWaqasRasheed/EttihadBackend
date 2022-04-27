const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    // validate(value) {
    //   if (!validator.isEmail(value)) {
    //     throw new Error("Email is invalid.");
    //   }
    // },
  },
  phone: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },

  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Building",
    required: true,
  },
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  //removing tokens
  delete userObject.tokens;
  //general modification
  userObject["id"] = userObject["_id"];
  delete userObject._id;
  delete userObject.__v;

  //also trimimg building
  userObject["building"] = userObject["buildingId"];
  userObject["building"]["id"] = userObject["building"]["_id"];
  delete userObject["buildingId"];
  delete userObject["building"].__v;
  delete userObject["building"]._id;
  //also hiding password
  delete userObject.passwordHash;
  return userObject;
};

//Defining login function on Schema
userSchema.statics.findByCredentials = async (email, password) => {
  let user = await User.findOne({ email }).populate("buildingId");
  if (!user) {
    throw new Error("Unable To Login");
  }
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Unable To Login");
  }
  return user;
};

//to generate auth token
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  //generatig a token
  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.ENCRYPTION_KEY
  );
  //saving token in taoken array
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", {
  virtuals: true,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
