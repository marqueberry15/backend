const express = require("express")
const route =express.Router()
const totalcamp = require("../controller/campaign")
const upload=require("../middleware/mutler")
const {saveinfo, updateinfo}= require("../controller/saveinfo")
route.post("/saveinfo",upload.single('file'),saveinfo)
route.put("/updateinfo/:Id",upload.single('file'),)
route.get("/campaign/:email?",totalcamp)
route.put("/updateinfo/:Id",updateinfo)

module.exports=route