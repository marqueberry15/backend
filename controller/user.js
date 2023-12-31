const ftp = require("basic-ftp");
const { PassThrough } = require("stream");
const getCurrentDateTime = require("./datetime")
const common = require("../common/common");
const config = require("../config/config");
const configr = {
  host: "154.41.233.75",
  port: process.env.ftpport,
  user: "u394360389.Admin",
  password: process.env.ftppassword,
};

async function connectFTP(buffer, fileName, folder) {
  const client = new ftp.Client();
  console.log(1);
  const readableStream = new PassThrough();
  readableStream.end(buffer);
  try {
    await client.access(configr);
    console.log(2);

    await client.cd(folder);
    console.log(3, buffer);

    await client.uploadFrom(readableStream, fileName, { overwrite: true });

    client.close();
    return 1;
  } catch (err) {
    console.error("Error:", err);
    client.close();
    return 0;
  }
}
exports.updateprofile = async (req, res) => {
  try {
    console.log("hey");
    const { date, time } = getCurrentDateTime();
    const fileName = `${date}_${time}`;
    const result = await connectFTP(
      req.file.buffer,
      fileName,
      "UserProfilePic"
    );
    if (result) {
      const updatedUser = await common.UpdateRecords(
        config.userTable,
        { ProfileDp: fileName },
        req.body.mobileNo
      );
      if (updatedUser) {
        return res.send({
          status: 200,
          msg: "Picture Uploaded Succesfully",
          file: fileName,
        });
      } else
        return res.send({ status: 401, msg: "Error in Picture Uploading" });
    } else {
      return res.send({
        status: 500,
        msg: "Facing Problem in Uploading Picture",
      });
    }
  } catch (err) {
    return res.status(501).send({ msg: err });
  }
};

exports.userDetail = async (req, res) => {
  console.log("USERRRRRRRRRRRRRR", req.query,'query is');
  const mobileNo = req.query.mobileNo

  const User = await common.GetRecords(config.userTable, "", { mobileNo });
  if (User.status) {
    return res.status(200).send({
      status: 200,
      msg: "Getting Details Successfully",
      data: User.data[0],
    });


  } else {
    return res.send({ status: 500, msg: "Error in Getting Details " });
  }
};

exports.createPost = async (req, res) => {
  try {
    console.log('hiiiii')
    const { date, time } = getCurrentDateTime();
    const fileName = `${date}_${time}`;
    const type = req.file.mimetype.split("/")[0];
    // const frnd = req.body.tag?req.body.tag:''

    const result = await connectFTP(req.file.buffer, fileName, "UserPost");
    console.log('resssss')

    const post = {
      mobileNo: req.body.mobileNo,
      content: req.body.content ? req.body.content : "",
      category: req.body.category ? req.body.category : "",
      fileName,
      type,
      date: `${date}_${time}`,
      profile:req.body.profile?req.body.profile:'',
      fullName:req.body.fullName?req.body.fullName:'',
      userNAme:req.body.userName?req.body.userName:''
    };

    // const mention = {
    //   user: frnd,
    //   type: req.body.type ? req.body.type : "",
    //   content: req.body.content ? req.body.content : "",
    //   category: req.body.category ? req.body.category : "",
    //   fileName,
    //   type,
    //   date: `${date}_${time}`,
    // };


    if (result) {
      console.log('resultttttt')
      const updatedUser = await common.AddRecords(
        "Post",
        post,
        req.body.mobileNo
      );
      if (updatedUser) {
        // const updatemention = await common.AddRecords("Mentios", mention, frnd);

        // if (updatemention) {
        //   return res.send({
        //     status: 200,
        //     msg: "Picture Uploaded Succesfully",
        //     file: fileName,
        //   });
        // } else
        //   return res.send({ status: 401, msg: "Error in Picture Uploading" });
        console.log('updateddddddd')
     return res.send({status:200,msg:"Picture uploaded Successfully",file:fileName})
     
      } else
        return res.send({ status: 401, msg: "Error in Picture Uploading" });
    } else {
      return res.send({
        status: 500,
        msg: "Facing Problem in Uploading Picture",
      });
    }
  } catch (err) {
    return res.status(501).send({ msg: err });
  }
};

exports.getPost = async (req, res) => {
  try {
    const mobileNo = req.query.mobileNo;
    console.log("mobile number", mobileNo);
    const postdetails = await common.GetRecords("Post", "", { mobileNo });
    if (postdetails.status === 200) {
      console.log(postdetails);
      return res.status(200).send({ status: 200, posts: postdetails.data });
    }
  } catch (err) {
    return res.status(500).json({ Error: err });
  }
};

exports.deletePost = async (req, res) => {
  try {
    console.log(req.body);
    let post_id = req.query.Id;
    let deleteLike = await common.deleteRecords("Post", `Id = ${post_id}`);

    if (deleteLike) {
      let response = {
        status: 200,
        msg: "Post deleted successfully.",
      };
      res.send(response);
    } else {
      let response = {
        status: 500,
        msg: "Something went wrong",
      };
      res.send(response);
    }
  } catch (err) {
    throw err;
  }
};

exports.allUsers = async (req, res) => {

  const User = await common.GetRecords(config.userTable, "", "");
  console.log(User);
  if (User.status) {
    return res.status(200).send({
      status: 200,
      msg: "Getting Details Successfully",
      data: User.data,
    });


  } else {
    return res.send({ status: 500, msg: "Error in Getting Details " });
  }
};

exports.getinterest = async (req, res) => {

  try {
    const Interest = req.query.interest;
 
    const interestsArray = Interest.split(' ');

  
    const postdetails = await common.GetPosts("Post", "", interestsArray);
    console.log(postdetails,'posttt details')
    if (postdetails.status === 200) {
      console.log(postdetails);
      return res.status(200).send({ status: 200, posts: postdetails.data });
    }
    else{
      return res.status(200).send({ status: 400, posts: []});

    }
  } catch (err) {
    return res.status(500).json({ Error: err });
  }
};