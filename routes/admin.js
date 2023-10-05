const express = require("express")
const upload=require("../middleware/mutler")
const route =express.Router()
const {login,save,approval} =require("../controller/admin")
route.post("/login",login)
route.post("/save/:type",upload.single('file'),save)
route.put("/action/:action",approval)

module.exports=route