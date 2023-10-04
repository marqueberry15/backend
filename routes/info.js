const express = require("express")
const route =express.Router()
const totalcamp = require("../controller/campaign")
const upload=require("../middleware/mutler")
const {saveinfo}= require("../controller/saveinfo")
route.post("/saveinfo",upload.single('file'),saveinfo)
route.get("/campaign/:email?",totalcamp)

// route.post("/logo",upload.single('file'),connectFTP,)

module.exports=route