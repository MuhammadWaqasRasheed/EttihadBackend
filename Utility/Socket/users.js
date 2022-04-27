const users = [];

const addUser = ({ socketId, username, branchId, roomName }) => {
  username = username.trim().toLowerCase();
  roomName = roomName.trim().toLowerCase();
  branchId = branchId.trim().toLowerCase();

  //validate the data
  if (!username || !roomName || !branchId) {
    return {
      error: "Username , branchId and roomName are required.",
    };
  }

  //check for existing user
  const existingUser = users.find((user) => {
    return user.username === username && user.roomName === roomName;
  });

  //validate username
  if (existingUser) {
    return {
      error: "username already taken!",
    };
  }

  //this code will run if username is unqiue
  const user = { socketId, username, branchId, roomName };
  users.push(user);
  return {
    user,
  };
};

const express = require("express");
const app = express();
// const redis = require("redis");
// const chalk = require("chalk");
// const { promisify } = require("util");

// import { createClient } from 'redis';

// const client = redis.createClient(6379);

// (async () => {
//   const client = redis.createClient();

//   client.on("error", (err) => console.log("Redis Client Error", err));

//   await client.connect();

//   await client.set("student", "hasher");
//   const value = await client.get("student");
//   console.log(value);
// })();

// client.on("connect", function() {
//   console.log(chalk.inverse.green("Connected!"));
//   // serializeObject(obj);
// });

const obj = {
  name: "M.waqas",
  age: 22,
  DOB: "19-11-2001",
};

serializeObject = async (obj) => {
  let res = JSON.stringify(obj);
  const getAsync = promisify(client.get).bind(client);

  // await getAsync("name", "zain");
  // client.setex("key", 3600, res);
  // client.get("key", (err, data) => {
  //   console.log(data);
  // });
};

const result = (module.exports = { addUser });
