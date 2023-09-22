const express = require("express")
const route =express.Router()
const connectFTP=require("../config/ftp")
const upload=require("../middleware/mutler")
const {saveinfo}= require("../controller/saveinfo")
console.log("requested")
route.post("/saveinfo",upload.single('file'),saveinfo)
// route.post("/logo",upload.single('file'),connectFTP,)

module.exports=route