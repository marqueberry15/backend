const express = require("express")
const route =express.Router()
const {login,generateAndSaveOTP, validatephoneOTP,validateOTP, getCampaign}=require("../controller/app")
route.post("/generateotp",generateAndSaveOTP)
route.post("/validatephone",validatephoneOTP)
route.post("/login",login)
route.post("/validateuser",validateOTP)
route.get("/campaigndetails",getCampaign)
module.exports=route