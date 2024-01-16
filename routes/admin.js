const express = require("express")
const upload=require("../middleware/mutler")
const route =express.Router()
const {login,save,approval,blog,cases, blogstudy, casestudy} =require("../controller/admin")
route.post("/login",login)
route.post("/save/:type",upload.single('file'),save)
route.put("/action/:action",approval)
route.get("/getBlog",blog)
route.get("/getblog/:header",blogstudy)
route.get("/getcaseStudy",cases)
route.get("/getcase/:header",casestudy)

module.exports=route