const jwt = require("jsonwebtoken");
const User = require("../models/user/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.ENCRYPTION_KEY);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    }).populate("buildingId");
    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please Authenticate" });
  }
};

module.exports = auth;
