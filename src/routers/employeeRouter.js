const express = require("express");
const mongoose = require("mongoose");
const Employee = require("../models/employee");
const router = express.Router();

//get All Employees
router.get("/", async (req, res) => {
  try {
    const employeesList = await Employee.find({});
    res.status(200).send(employeesList);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in fetching User List from Database",
      error,
    });
  }
});

//get an Employee by id
router.get("/:id", async (req, res) => {
  //checking if it is a valid object id
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid Object ID.",
    });
  }
  //fetch record from database
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status.json({
        success: false,
        message: "The employee with given id not Found",
      });
    }
    res.status(200).send(employee);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in Fetching Record from database.",
    });
  }
});

//delete an Employee by id
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid Object ID.",
    });
  }
  //deleting record from database
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: "employee with given ID not found!",
      });
    }
    employee.remove();
    res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

//create a new Employee
router.post("/", async (req, res) => {
  try {
    let newEmployee = new Employee({
      name: req.body.name,
      branchId: req.body.branchId,
      contactNo: req.body.contactNo,
      address: req.body.address,
    });

    newEmployee = await newEmployee.save();
    if (!newEmployee) {
      return res.status(400).json({
        success: false,
        message: "newEmployee cannot be created.",
      });
    }
    res.status(201).send(newEmployee);
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
});

module.exports = router;
