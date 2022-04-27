//server imports
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
var server = http.Server(app);
const chalk = require("chalk");

//redis imports
const redisService = require("./Utility/redis/redisService");

//to allow cross apps calls to accept from our server
// app.use(cors());
// app.options("*", cors());
// app.use(
//   cors({
//     origin: "*",
//   })
// );
app.use(cors());

//database imports
const mongoose = require("mongoose");

//router imports
const chemicalRouter = require("./src/routers/chemicalRouter");
const branchRouter = require("./src/routers/branchRouter");
const buildingRouter = require("./src/routers/buildingRouter");
const sensorInfoRouter = require("./src/routers/sensor/sensorInfoRouter");
const sensorTypeRouter = require("./src/routers/sensor/sensorType");
const sensorRealTimeDataRouter = require("./src/routers/sensor/sensorRealTimeDataRouter");
const wipedDataRouter = require("./src/routers/sensor/wipedDataRouter");
const employeeRouter = require("./src/routers/employeeRouter");
const vehicleRouter = require("./src/routers/order/vehicleRouter");
const orderRouter = require("./src/routers/order/orderRouter");
const shipmentRouter = require("./src/routers/order/shipmentRouter");
const userRouter = require("./src/routers/user/userRouter");

//image
// import img from "./assets/images/alertImage.png";

//model imports
const SensorInfo = require("./src/models/sensors/sensorInfo");

//Middleware
app.use(express.json());
//middlewares for routers
app.use("/chemical", chemicalRouter);
app.use("/branch", branchRouter);
app.use("/building", buildingRouter);
app.use("/sensorInfo", sensorInfoRouter);
app.use("/sensorType", sensorTypeRouter);
app.use("/sensorRealTimeData", sensorRealTimeDataRouter);
app.use("/wipedData", wipedDataRouter);
app.use("/employee", employeeRouter);
app.use("/vehicle", vehicleRouter);
app.use("/order", orderRouter);
app.use("/shipment", shipmentRouter);
app.use("/user", userRouter);

//Variables
const PORT = process.env.PORT || 4000;
DB_PATH = "mongodb://127.0.0.1:27017/Chemials_DB";
DB_CONF = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
};
// 1hour = 60 min * 60 sec
const TTL = 20; //1 min

//making connection to database
mongoose
  .connect("mongodb://127.0.0.1:27017/Chemials_DB")
  .then((res) => {
    console.log("Database Connection Successfull.");
  })
  .catch((err) => {
    console.log("Database Connection Error");
  });

//initializing Redis Database Also
redisService.initializeDatabase();

/*--------------------------------------------------------Realtime Server--------------------------------------------------- */

//making realtime server
var io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

//realtime server imports
const socketUserService = require("./Utility/Socket/users");
const SaveRealtimeValue = require("./Utility/Sensors/Sensor");
const saveOrder = require("./Utility/order/order");
const sendMail = require("./Utility/mailService/mail");

//realtime server implementaion
// const Realtime = require("./Utility/Sensors/Sensor");
io.on("connection", (socket) => {
  console.log(`Connection successfull with socketID : ${socket.id}`);

  /* ---------------- Events ---------------- */

  //Join event
  socket.on("join", ({ username, branchId }, callback) => {
    //adding user to my reddis in memory database
    // const { error, user } = socketUserService.addUser({
    //   socketId: socket.id,
    //   username,
    //   branchId,
    //   roomName,
    // });
    //if error than respond back with an error
    // if (error) {
    //   return callback(error);
    // }
    //join user to that particular room
    socket.join(branchId);
    callback();
  });

  //brodcast messages event
  socket.on("recieveData", async (data) => {
    // socket.emit("sensorData", { roomName: "KSK", sensorList: tempList });
    let updatedList = data.sensorList.map(async (sensor) => {
      //save realtime value of sensor in database
      // await SaveRealtimeValue(sensor);  //uncomment it later
      //first fetch it in Redis Database
      let sensorObj = await redisService.getObject(sensor.sensorId);
      //if obj not found in redis than find it in MongoDB
      if (sensorObj == null) {
        console.log(chalk.inverse.red("Fetching From MongoDB"));
        sensorObj = await SensorInfo.findById(sensor.sensorId).populate(
          "buildingId"
        );

        //also save this object in redis
        const key = sensor.sensorId;
        await redisService.saveObject(key, TTL, sensorObj);
      } else {
        // console.log(chalk.inverse.green("Fetching From Redis"));
      }
      //checking for each sensor if threshold goes below a certain threshold than generate SMS and Gmail alert
      percentValue = (sensor.value / sensorObj.maxVal) * 100;
      // console.log(sensorObj);

      return {
        sensorId: sensorObj.id,
        name: sensorObj.name,
        percent: (sensor.value / sensorObj.maxVal) * 100,
        buildingId: sensorObj.building
          ? sensorObj.building.id
          : sensorObj.buildingId._id,
        chemicalId: sensorObj.chemical
          ? sensorObj.chemical
          : sensorObj.chemicalId,
        value: sensor.value,
        date: sensor.date,
        time: sensor.time,
        alert: percentValue <= sensorObj.thresholdValue ? true : false,
      };
    });

    updatedList = await Promise.all(updatedList);
    // console.log(updatedList);

    let alertList = (await redisService.getObject("alerts")) || [];
    let orderList = updatedList.map(async (sensor, index) => {
      if (sensor.alert) {
        let found = alertList.find((id) => id == sensor.sensorId);
        if (!found) {
          alertList.push(sensor.sensorId);
          return sensor;
        }
      } else {
        let found = alertList.find((id) => id == sensor.sensorId);
        if (found) {
          //than rmove it
          alertList = alertList.filter((id) => id != sensor.sensorId);
        }
      }
    });
    //finally save updated alert list
    await redisService.saveObject("alerts", -1, alertList);

    /*---------------------------------------Generating and saving Order Section------------------------------*/

    //now save order in MongoDB for sensors
    orderList = await Promise.all(orderList);
    orderList = orderList.filter((sensor) => sensor);

    //if some orders
    // if (orderList.length != 0) {
    //   let order = {
    //     orderItems: [],
    //     orderStatus: "Pending",
    //     buildingId: updatedList[0].buildingId,
    //   };

    //   order.orderItems = orderList.map((sensor) => {
    //     return {
    //       chemicalId: sensor.chemicalId,
    //       quantity: 10,
    //     };
    //   });

    //   //now finally saving the order
    //   saveOrder(order);
    //   console.log(chalk.inverse.blue("Order Placed Successfully"));

    //   //generating Email Alerts
    //   let recipientList = [
    //     // "waqasrasheed605@gmail.com",
    //     "waqasrasheed5005@gmail.com",
    //   ];
    //   let alertMsg = `<h3>Following are Sensors Alert Details : <h3>
    //   <ol>`;
    //   orderList.map((obj, index) => {
    //     alertMsg += `<li>${obj.name} falls below ${obj.percent}% </li>`;
    //   });
    //   //adding Site and building information
    //   alertMsg += `</ol> `;
    //   alertMsg += `<img src="https://w7.pngwing.com/pngs/561/1010/png-transparent-warning-sign-scalable-graphics-alert-s-angle-triangle-wikimedia-commons.png" alt="pic Missing"/>`;
    //   console.log(alertMsg);
    //   let res = await sendMail(recipientList, alertMsg);
    //   console.log(chalk.inverse.green(res));
    // }

    //broadcast data to that room
    io.to("all").emit("BroadcastData", updatedList);
  });

  //Disconnect Event
  socket.on("disconnect", () => {
    console.log(`Disconnected from socket having ID = ${socket.id}`);
  });
});

//listening to PORT
server.listen(PORT, () => {
  console.log(`Server Is Up and Running od PORT : ${PORT}`);
});
