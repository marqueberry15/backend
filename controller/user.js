const ftp = require("basic-ftp");
const { PassThrough } = require("stream");
const getCurrentDateTime = require("./datetime")
const common = require("../common/common");
const config = require("../config/config");
// const sharp = require('sharp');

const configr = {
  host: "154.41.233.75",
  port: process.env.ftpport,
  user: "u394360389.Admin",
  password: process.env.ftppassword,
};

async function connectFTP(buffer, fileName, folder) {
  const client = new ftp.Client();
  const readableStream = new PassThrough();
  readableStream.end(buffer);
  try {
    await client.access(configr);
  

    await client.cd(folder);

    await client.uploadFrom(readableStream, fileName, { overwrite: true });

    client.close();
    return 1;
  } catch (err) {
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
    // const resizedImageBuffer = await sharp(req.file.buffer)
    //   .resize({ width: 800, height: 600, fit: 'inside' })
    //   .toBuffer();

    
    const type = req.file.mimetype.split("/")[0];
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

const uploadPost = async (req, res, file) => {
 
  const { date, time } = getCurrentDateTime();
  const fileName = `${date}_${time}_${file.originalname}`;
  const type = file.mimetype.split("/")[0];
  
  try {
    const result = await connectFTP(file.buffer, fileName, "UserPost");
    if (result) {
      const post = {
        mobileNo: req.body.mobileNo,
        content: req.body.content || "",
        category: req.body.category || "",
        fileName,
        type,
        date: `${date}_${time}`,
        profile: req.body.profile || '',
        fullName: req.body.fullName || '',
        userName: req.body.userName || ''
      };

      const updatedUser = await common.AddRecords("Post", post, req.body.mobileNo);
      if (updatedUser) {
        return { status: 200, msg: "Picture uploaded Successfully", file: fileName };
      } else {
        return { status: 401, msg: "Error in Picture Uploading" };
      }
    } else {
      return { status: 500, msg: "Facing Problem in Uploading Picture" };
    }
  } catch (err) {
    throw err;
  }
};

exports.createPosts = async (req, res) => {
  try {

    const files = req.files 

    if (!files || files.length === 0) {
      return res.status(400).send({ status: 400, msg: "No files uploaded" });
    }

    const uploadPromises = files.map(file => uploadPost(req, res, file));
    const results = await Promise.all(uploadPromises);

  
    const isSuccess = results.every(result => result.status === 200);

    if (isSuccess) {
      return res.status(200).send(results);
    } else {
      return res.status(500).send(results.find(result => result.status === 500));
    }
  } catch (err) {
    return res.status(501).send({ msg: err });
  }
};

exports.createTemplates = async (req, res) => {
  try {

    const files = req.files 

    if (!files || files.length === 0) {
      return res.status(400).send({ status: 400, msg: "No files uploaded" });
    }

    const uploadPromises = files.map(file => uploadTemplate(req, res, file));
    const results = await Promise.all(uploadPromises);  
    const isSuccess = results.every(result => result.status === 200);


    if (isSuccess) {
      return res.status(200).send(results);
    } else {
      console.log('234343',)
      return res.status(500).send(results.find(result => result.status === 500));
    }
  } catch (err) {
    return res.status(501).send({ msg: err });
  }
};

const uploadTemplate = async (req, res, file) => {
 
  const { date, time } = getCurrentDateTime();
  const fileName = `${date}_${time}_${file.originalname}`;
  const type = file.mimetype.split("/")[0];
  const name  = file.originalname
  
  try {
    const result = await connectFTP(file.buffer, fileName, "Template/Image");
    if (result) {
      const post = {
      
        fileName,
        type,
        name
      
      
      };

      const updatedUser = await common.AddRecords("Template_Image", post );
      if (updatedUser) {
        
        return { status: 200, msg: "Picture uploaded Successfully", file: fileName };
      } else {
        console.log(post,'facing error')
        return { status: 401, msg: "Error in Picture Uploading" };
      }
    } else {
      return { status: 500, msg: "Facing Problem in Uploading Picture" };
    }
  } catch (err) {

    throw err;
  }
};

exports.getTemplate = async (req, res) => {
  try {
    
    const postdetails = await common.GetRecords("Template_Image", "", "");
    if (postdetails.status === 200) {
  
      return res.status(200).send({ status: 200, posts: postdetails.data });
    }
  } catch (err) {
    return res.status(500).json({ Error: err });
  }
};





