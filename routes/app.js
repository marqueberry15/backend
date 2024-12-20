const express = require("express");
const route = express.Router();
const upload = require("../middleware/mutler");
const {
  login,
  generateAndSaveOTP,
  validatephoneOTP,
  validateOTP,
  getCampaign,
  update,
  saveInterest,
  contact,
  verify,
  withdrawmail,
  sendresponse,
} = require("../controller/app");
const {
  updateprofile,
  userDetail,
  createPost,
  getPost,
  deletePost,
  allUsers,
  getinterest,
  createPosts,
  createTemplates,
  getTemplate,
  follow,
  getfollow,
  getfollowers,
  getFollowingList,
  getFollowerList,
  deletefollow,
  updatewallpaper,
  userTemplate,
  applycampaign,
  getUserTemplate,
  createcontest,
  applycontest,
  getnotification,
  getallPost,
  getrelevant,
  balance,
  deleteusertemplate,
  getResult,
  makeinvoice,
  uploadinvoice,
  getverified,
} = require("../controller/user");
const {
  postComment,
  getAllComments,
  getfollowuserName,
  hitlike,
  getlike,
  unlike,
  getcontest,
  deletecontest,
  gettrendingtemplate,
  userlike,
  hide,
  blockuser,
  allpost,
  updatepost,
  delpost,
  getBrandCampaign,
  contestapplicants,
  getalltemplates,
  deltemplate,
  updatetemplate,
  saveResult,
  getallusers,
  support,
  complete,
  updatecontest,
  notification,
  report,
  getmemetemplate,
} = require("../controller/post");
const { payment, success } = require("../controller/saveinfo");
route.post("/generateotp", generateAndSaveOTP);
route.post("/validatephone", validatephoneOTP);
route.post("/login", login);
route.post("/validateuser", validateOTP);
route.get("/campaigndetails", getCampaign);
route.put("/updatedetails", update);
route.post("/saveInterest", saveInterest);
route.post("/contact", contact);
route.post("/uploaddp", upload.single("image"), updateprofile);
route.get("/userdetails", userDetail);
route.get("/allusers", allUsers);
route.post("/createpost", upload.single("file"), createPost);
route.get("/userpost", getPost);
route.delete("/deletepost", deletePost);
route.get("/userinterest", getinterest);
route.post("/createallpost", upload.array("files"), createPosts);
route.post("/createtemplate", upload.array("files"), createTemplates);
route.get("/getalltemplates", getTemplate);
route.post("/postcomment", postComment);
route.get("/getallcomment", getAllComments);
route.post("/follow", follow);
route.get("/getfollow", getfollow);
route.get("/getfollowers", getfollowers);
route.get("/userfollower", getFollowerList);
route.get("/userfollowing", getFollowingList);
route.post("/deletefollow", deletefollow);
route.post("/updatewallpaper", upload.single("image"), updatewallpaper);
route.post("/uploadtemplate", upload.single("file"), userTemplate);
route.post("/applycampaign", upload.single("media"), applycampaign);
route.get("/getusertemplate", getUserTemplate);
route.get("/getusernamefollow", getfollowuserName);
route.post("/hitlike", hitlike);
route.get("/getlikes", getlike);
route.delete("/unlike", unlike);
route.post("/createcontest", upload.single("file"), createcontest);
route.get("/getallcontest", getcontest);
route.delete("/deletecontest", deletecontest);
route.get("/gettrendingtemplate", gettrendingtemplate);
route.get("/getmemetemplate",getmemetemplate)
route.post("/applycontest", upload.single("file"), applycontest);
route.get("/getnotification", getnotification);
route.get("/getresult", getResult);
route.get("/userlikes", userlike);
route.get("/getallpost", getallPost);
route.get("/getrelevantpost", getrelevant);
route.get("/getbalance", balance);
route.post("/hide", hide);
route.post("/block", blockuser);
route.post("/walletotp", verify);
route.post("/walletmail", withdrawmail);
route.get("/allpost", allpost);
route.post("/approvepost", updatepost);
route.delete("/rejectpost", delpost);
route.get("/getBrandCampaign", getBrandCampaign);
route.delete("/deletetemplate", deleteusertemplate);
route.get("/contestapplicants", contestapplicants);
route.get("/alltemplates", getalltemplates);
route.post("/approvetemplate", updatetemplate);
route.post("/rejecttemplate", deltemplate);
route.post("/saveresult", saveResult);
route.get("/user", getallusers);
route.get("/support", support);
route.post("/sendresponse", sendresponse);
route.put("/updatecontest/:Id", upload.single("file"), updatecontest);
route.post("/send", notification);
route.put("/report",report)
route.post("/makeinvoice",makeinvoice)
route.post("/uploadinvoice", upload.single("file"), uploadinvoice);
route.post("/getverified",getverified)

module.exports = route;
