const redis = require("redis");
const chalk = require("chalk");
const client = redis.createClient();

const initializeDatabase = async () => {
  client.on("error", (err) => {
    console.log(chalk.bold.red("Redis Client Error."));
    console.log(err);
  });
  client.on("connect", () =>
    console.log(chalk.bold.green("Redis connection Successfull."))
  );
  await client.connect();

  await client.set("key", "value");
  const value = await client.get("key");
};

const saveObject = async (key, ttl, obj) => {
  const JSON_Obj = JSON.stringify(obj);
  //than save object permanently
  if (ttl <= -1) {
    await client.set(key, JSON_Obj);
  } else {
    await client.setEx(key, ttl, JSON_Obj);
  }

  return;
};

const getObject = async (key) => {
  if (key == null) {
    return null;
  }
  let obj = await client.get(key);
  obj = JSON.parse(obj);
  //   console.log(obj);
  return obj;
};

// const main = async () => {
//   await initializeDatabase();
//   const obj = {
//     name: "Muhammad Waqas Rasheed",
//     age: 10,
//   };
//   await saveObject("person", 30, obj);
//   const res = await getObject("person1");
//   return res;
// };

// main();

module.exports = {
  initializeDatabase,
  saveObject,
  getObject,
};
