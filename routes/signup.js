const {register,login,hello} = require("../controller/signup")
const express = require("express")
const route =express.Router()
console.log(login,register)
route.post("/signup",register)
console.log(345435)
route.post("/login",login)
route.post("/hello",hello)


module.exports=route