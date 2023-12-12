const express = require("express")
const route =express.Router()
console.log("HEYYYYYYY")
const {login,generateAndSaveOTP, validatephoneOTP,validateOTP }=require("../controller/app")
route.post("/generateotp",generateAndSaveOTP)
route.post("/validatephone",validatephoneOTP)
route.post("/login",login)
route.post("/validateuser",validateOTP)
module.exports=route