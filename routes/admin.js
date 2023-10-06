const express = require("express")
const upload=require("../middleware/mutler")
const route =express.Router()
const {login,save,approval,blog} =require("../controller/admin")
route.post("/login",login)
route.post("/save/:type",upload.single('file'),save)
route.put("/action/:action",approval)
route.get("/getBlog",blog)

module.exports=route