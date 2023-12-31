const express = require("express")
const route =express.Router()
const upload=require("../middleware/mutler")
const {login,generateAndSaveOTP, validatephoneOTP,validateOTP, getCampaign,update,saveInterest,contact}=require("../controller/app")
const { updateprofile,userDetail,createPost,getPost, deletePost, allUsers, getinterest} = require("../controller/user")
route.post("/generateotp",generateAndSaveOTP)
route.post("/validatephone",validatephoneOTP)
route.post("/login",login)
route.post("/validateuser",validateOTP)
route.get("/campaigndetails",getCampaign)
route.put("/updatedetails",update)
route.post("/saveInterest",saveInterest)
route.post("/contact",contact)
route.post("/uploaddp",upload.single("image"),updateprofile)
route.get("/userdetails",userDetail)
route.get("/allusers",allUsers)
route.post("/createpost",upload.single("file"),createPost)
route.get("/userpost",getPost)
route.delete("/deletepost",deletePost)
route.get("/userinterest",getinterest)
module.exports=route




