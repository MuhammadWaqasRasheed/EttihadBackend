const express = require("express");
const app = express();
const redis = require("redis");
const chalk = require("chalk");

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.PORT || 6379;

console.log(REDIS_PORT);

const client = redis.createClient(REDIS_PORT);

// client.setEx("name", 3600, "Muhammad Waqas Rasheed");

client.on("connect", function () {
  console.log(chalk.inverse.green("Connected!"));
});

//listening to PORT
app.listen(PORT, () => {
  //   console.log(`Server Is Up and Running od PORT : ${PORT}`);
});
