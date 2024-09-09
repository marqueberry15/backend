const contact = require("../controller/contact")
const express = require("express")
const contactapp = require("../controller/contact-app")
const route =express.Router()

route.post("/send",contact)
route.post("/contact",contactapp)

module.exports=route