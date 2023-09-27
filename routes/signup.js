const {register,login,changepassword} = require("../controller/signup")
const express = require("express")
const route =express.Router()
route.post("/signup",register)
route.post("/login",login)
route.put("/password",changepassword)


module.exports=route