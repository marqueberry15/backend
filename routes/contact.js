const contact = require("../controller/contact")
const express = require("express")
const route =express.Router()

route.post("/send",contact)

module.exports=route