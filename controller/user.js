const ftp = require("basic-ftp");
const { PassThrough } = require("stream");
const getCurrentDateTime = require("./datetime");
const common = require("../common/common");
const config = require("../config/config");
// const ffmpeg = require('ffmpeg');
const connectDB= require("../config/db")
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const axios = require("axios");
const thumbsupply = require("thumbsupply");
const { update } = require("./app");
const configr = {
  host: "154.41.233.75",
  port: process.env.ftpport,
  user: "u394360389.Admin",
  password: process.env.ftppassword,
};

const configur = {
  host: process.env.ftphost,
  port: process.env.ftpport,
  user: process.env.ftpuser,
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
  const mobileNo = req.query.mobileNo;

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
   
    const { date, time } = getCurrentDateTime();

    const type = req.file.mimetype.split("/")[0];
    const ext = req.file.mimetype.split("/")[1];
    const fileName = `${date}_${time}.${ext}`;

    const result = await connectFTP(req.file.buffer, fileName, "UserPost");
   

    const post = {
      mobileNo: req.body.mobileNo,
      content: req.body.content ? req.body.content : "",
      category: req.body.category ? req.body.category : "",
      fileName,
      type,
      date: `${date}_${time}`,
      profile: req.body.profile ? req.body.profile : "",
      fullName: req.body.fullName ? req.body.fullName : "",
      userName: req.body.userName ? req.body.userName : "",
      Status: 0,
      // thumbnailFileName,
    };

    if (result) {
    
      const updatedUser = await common.AddRecords(
        "Post",
        post,
        req.body.mobileNo
      );
      if (updatedUser) {
        return res.send({
          status: 200,
          msg: "Picture uploaded Successfully",
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
async function extractThumbnailAndUpload(videoUri, videoFileName, ftpFolder) {

  // return new Promise(async (resolve, reject) => {
  //   const ftpClient = new ftp.Client();

  //   const thumbnailStream = new PassThrough();

  //   try {
  //     await ftpClient.access(configr);

  //     ffmpeg()
  //       .input(`https://www.adoro.social/UserPost/2024-04-22_17:35:07:615.mp4`)
  //       .outputOptions(['-vf', 'thumbnail,scale=640:360'])
  //       .outputFormat('image2pipe')
  //       .on('error', (err) => reject(err))
  //       .on('end', () => resolve())
  //       .pipe(thumbnailStream);

  //     thumbnailStream.on('end', async () => {
  //       thumbnailStream.end();
  //       resolve();
  //     });

  //     thumbnailStream.on('error', (err) => {
  //       thumbnailStream.end();
  //       reject(err);
  //     });

  //     const thumbnailFileName = `${videoFileName}_thumbnail.jpg`;
  //     const remotePath = `${ftpFolder}/${thumbnailFileName}`; // Construct remote path
  //     thumbnailStream.pipe(ftpClient.putStream(thumbnailStream, remotePath));
  //   } catch (err) {
  //     reject(err);
  //   }
  // });
  const timestamp = Date.now();

  thumbsupply
    .generateThumbnail(
      `https://www.adoro.social/UserPost/2024-04-23_15:36:33:146.mp4`,
      {
        timestamp,
        forceCreate: true,
        mimetype: "video/mp4",
        buffer: true,
      }
    )
    .then((thumb) => {
      console.log(thumb);
    });
}

exports.getPost = async (req, res) => {
  try {
    const mobileNo = req.query.mobileNo;

    const postdetails = await common.GetRecords("Post", "", { mobileNo });
    if (postdetails.status === 200) {
      return res.status(200).send({ status: 200, posts: postdetails.data });
    }
  } catch (err) {
    return res.status(500).json({ Error: err });
  }
};
exports.getallPost = async (req, res) => {
  try {
    const userId = req.query.userId;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    console.log('ggggggggggggggggggggg',userId,limit,offset)
    
    const sql = `SELECT *
    FROM Post
    WHERE userName NOT IN (
      SELECT BlockedUserName
      FROM Block
      WHERE UserId = ${userId}
    ) AND Id NOT IN (
      SELECT PostId
      FROM Hide_Post
      WHERE UserId = ${userId}
    ) 
    ORDER BY date DESC, LikesCount DESC, CommentCount DESC
    LIMIT ${limit} OFFSET ${offset};
    `;
    
    const postdetails = await common.customQuery(sql);
    
    if (postdetails.status == 200) {
      return res.status(200).send({ status: 200, posts: postdetails.data });
    }
  } catch (err) {
    return res.status(500).json({ Error: err });
  }
};

exports.deletePost = async (req, res) => {
  try {
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

    const interestsArray = Interest.split(" ");

    // const postdetails = await common.GetPosts(
    //   "Post",
    //   "",
    //   interestsArray,
    //   req.query.UserId
    // );
    const postdetails = await common.GetRecords("Post","","")
    if (postdetails.status === 200) {
      return res.status(200).send({ status: 200, posts: postdetails.data });
    } else {
      return res.status(200).send({ status: 400, posts: [] });
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
        profile: req.body.profile || "",
        fullName: req.body.fullName || "",
        userName: req.body.userName || "",
      };

      const updatedUser = await common.AddRecords(
        "Post",
        post,
        req.body.mobileNo
      );
      if (updatedUser) {
        return {
          status: 200,
          msg: "Picture uploaded Successfully",
          file: fileName,
        };
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
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).send({ status: 400, msg: "No files uploaded" });
    }

    const uploadPromises = files.map((file) => uploadPost(req, res, file));
    const results = await Promise.all(uploadPromises);

    const isSuccess = results.every((result) => result.status === 200);

    if (isSuccess) {
      return res.status(200).send(results);
    } else {
      return res
        .status(500)
        .send(results.find((result) => result.status === 500));
    }
  } catch (err) {
    return res.status(501).send({ msg: err });
  }
};

exports.createTemplates = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).send({ status: 400, msg: "No files uploaded" });
    }

    const uploadPromises = files.map((file) => uploadTemplate(req, res, file));
    const results = await Promise.all(uploadPromises);
    const isSuccess = results.every((result) => result.status === 200);

    if (isSuccess) {
      return res.status(200).send(results);
    } else {
      return res
        .status(500)
        .send(results.find((result) => result.status === 500));
    }
  } catch (err) {
    return res.status(501).send({ msg: err });
  }
};

const uploadTemplate = async (req, res, file) => {
  const { date, time } = getCurrentDateTime();
  const fileName = `${date}_${time}_${file.originalname}`;
  const type = file.mimetype.split("/")[0];

  try {
    const result = await connectFTP(file.buffer, fileName, "TrendingTemplate");
    if (result) {
      const template = {
        fileName,
        type,
      };

      const updatedUser = await common.AddRecords(
        "Trending_Template",
        template
      );
      if (updatedUser) {
        return {
          status: 200,
          msg: "Picture uploaded Successfully",
          file: fileName,
        };
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

exports.follow = async (req, res) => {
  try {
    let userName = req.body.userName;
    let Follow_id = req.body.follow_id;

    const existingRecord = await common.GetRecords("Follow", "", {
      userName,
      Follow_id,
    });

    if (existingRecord.status) {
      let response = {
        status: 400,
        msg: "Duplicate record. This user is already being followed.",
      };
      return res.send(response);
    }

    const addobj = {
      userName,
      Follow_id,
    };

    let addRecord = await common.AddRecords("Follow", addobj);

    let sql = `SELECT User.ProfileDp FROM User Where User.userName = '${userName}';`;
    const getdp = await common.customQuery(sql);

    if (addRecord) {
      const noti = {
        msg: `${userName} started following you`,
        userId: Follow_id,
        Dp: getdp.data[0].ProfileDp,
      };

      const notisend = await common.AddRecords("Notification", noti);
      if (notisend.status) {
      }
      let response = {
        status: 200,
        msg: "Successfully added comment to the database",
      };
      res.send(response);
    } else {
      let response = {
        status: 500,
        msg: "Something went wrong while adding comment to the database",
      };
      res.send(response);
    }
  } catch (err) {}
};

exports.getfollow = async (req, res) => {
  try {
    const Follow_Id = req.query.Id;

    const getfollower = await common.GetRecords("Follow", "", {
      userName: Follow_Id,
    });

    if (getfollower.status == 200) {
      return res.status(200).send({ status: 200, followers: getfollower.data });
    } else
      return res.status(401).send({ msg: "Cannot found the follower details" });
  } catch (err) {
    return res.status(501).send({ msg: "Error while fetching the details" });
  }
};

exports.getfollowers = async (req, res) => {
  try {
    const Follow_id = req.query.Id;

    const getfollower = await common.GetRecords("Follow", "", { Follow_id });

    if (getfollower.status == 200) {
      return res.status(200).send({ status: 200, followers: getfollower.data });
    } else
      return res.status(401).send({ msg: "Cannot found the follower details" });
  } catch (err) {
    return res.status(501).send({ msg: "Error while fetching the details" });
  }
};

exports.getFollowerList = async (req, res) => {
  try {
    let user_id = req.query.Id;
    let follower_user_ids = req.query.arr;

    if (
      !follower_user_ids ||
      !Array.isArray(follower_user_ids) ||
      follower_user_ids.length === 0
    ) {
      let response = {
        status: 400,
        msg: "Invalid or empty follower_user_ids array",
      };
      return res.send(response);
    }

    // let follower_user_ids_str = follower_user_ids.join(",");

    const commaSeparatedString = follower_user_ids
      .map((value) => `'${value}'`)
      .join(", ");

    let sql = `SELECT User.Id, User.userName, User.fullName, User.ProfileDp FROM User Where User.userName In (${commaSeparatedString});`;

    let getUser = await common.customQuery(sql);

    if (getUser.data.length > 0) {
      let response = {
        status: 200,
        msg: "Data Available",
        data: getUser.data,
      };
      res.send(response);
    } else {
      let response = {
        status: 500,
        msg: "No data available",
      };
      res.send(response);
    }
  } catch (err) {
    throw err;
  }
};

exports.getFollowingList = async (req, res) => {
  try {
    let user_id = req.query.Id;
    let follower_user_ids = req.query.arr;

    if (
      !follower_user_ids ||
      !Array.isArray(follower_user_ids) ||
      follower_user_ids.length === 0
    ) {
      let response = {
        status: 400,
        msg: "Invalid or empty follower_user_ids array",
      };
      return res.send(response);
    }

    const commaSeparatedString = follower_user_ids
      .map((value) => `'${value}'`)
      .join(", ");

    let sql = `SELECT User.Id, User.userName, User.fullName, User.ProfileDp FROM User Where User.Id In (${commaSeparatedString});`;

    let getUser = await common.customQuery(sql);

    if (getUser.data.length > 0) {
      let response = {
        status: 200,
        msg: "Data Available",
        data: getUser.data,
      };
      res.send(response);
    } else {
      let response = {
        status: 500,
        msg: "No data available",
      };
      res.send(response);
    }
  } catch (err) {
    throw err;
  }
};

exports.deletefollow = async (req, res) => {
  const userName = req.body.userName;
  const Follow_user = req.body.Id_name;
  const sql = `DELETE FROM Follow
  WHERE userName = '${userName}'
  AND Follow_id = (SELECT Id FROM User WHERE userName = '${Follow_user}')
  `;
  let getUser = await common.customQuery(sql);

  res.status(200).send(getUser);
};

exports.updatewallpaper = async (req, res) => {
  try {
    const { date, time } = getCurrentDateTime();
    const fileName = `${date}_${time}`;
    const result = await connectFTP(req.file.buffer, fileName, "UserWallpaper");
    if (result) {
      const updatedUser = await common.UpdateRecords(
        config.userTable,
        { wallPaper: fileName },
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

exports.userTemplate = async (req, res) => {
  try {
    const { date, time } = getCurrentDateTime();

    const fileName = `${date}_${time}`;

    const result = await connectFTP(req.file.buffer, fileName, "UserTemplate");

    if (result) {
      const updatedUser = await common.AddRecords("User_Template", {
        fileName,
        user: req.body.userName,
        caption: req.body.caption,
        category: req.body.category,
      });
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

exports.applycampaign = async (req, res) => {
  try {
    const { date, time } = getCurrentDateTime();
    const { campaign_name, userName } = req.body;

    const fileName = `${date}_${time}_${campaign_name}`;

    const result = await connectFTP(req.file.buffer, fileName, "Campaign");

    if (result) {
      const insertQuery = `INSERT INTO Campaign (campaign_name, fileName, type, time, userName) VALUES (?, ?, ?, ?, ?)`;

      await connectDB.query(insertQuery, [
        campaign_name,
        fileName,
        req.file.mimetype,
        time,
        userName,
      ]);

      return res.send({
        status: 200,
        msg: "Picture Uploaded Successfully",
        file: fileName,
      });
    }
  } catch (err) {
    console.error('Error occurred:', err);
    return res.status(500).send({ msg: 'Internal Server Error', error: err.message });
  }
};


exports.getUserTemplate = async (req, res) => {
  try {
    const user = req.query.user;

    const templatedetails = await common.GetRecords("User_Template", "", {
      user,
    });

    if (templatedetails.status === 200) {
      return res
        .status(200)
        .send({ status: 200, templates: templatedetails.data });
    }
  } catch (err) {
    return res.status(500).json({ Error: err });
  }
};

exports.createcontest = async (req, res) => {
  try {
    const { date, time } = getCurrentDateTime();

    const fileName = `${date}_${time}_${req.body.contestName}`;

    const { Description, contestName } = req.body;
    const result = await connectFTP(req.file.buffer, fileName, "Contest");

    const contestobj = {
      Description,
      contestName,
      fileName,
      date: `${date}_${time}`,
      time_limit:req.body.time
    };
    const addcontest = await common.AddRecords("Contest", contestobj);
   
    if (addcontest) {
      const noti = {
        msg: ` New Contest is Live. Apply Now to the contest ${contestName}`,
        userId: 0,
      };
      const notisend = await common.AddRecords("Notification", noti);
    
      if (notisend.status) {
       
        return res
          .status(200)
          .send({ msg: "Contest Created Successfully", status: 200 });
      }

      // return res
      //   .status(200)
      //   .send({ msg: "Contest Created Successfully", status: 200 });
    } else {
      return res.status(401).send({ msg: "Facing problem in backend" });
    }
  } catch (err) {
    throw err;
  }
};

exports.applycontest = async (req, res) => {
  try {
    const { date, time } = getCurrentDateTime();
    const { contestName, userName } = req.body;

    const fileName = `${date}_${time}_${userName}`;

    const result = await connectFTP(req.file.buffer, fileName, "ContestApply");

    if (result) {
      const updatedUser = await common.AddRecords("Contest_Apply", {
        fileName,
        contestName,
        time,
        type: req.file.mimetype,
        userName,
      });
      if (updatedUser) {
        return res.send({
          status: 200,
          msg: "Applied  Succesfully",
        });
      } else
        return res.send({ status: 401, msg: "Error in Picture Uploading" });
    } else {
      return res.send({
        status: 500,
        msg: "Facing Problem in Applyying for Campaign",
      });
    }
  } catch (err) {
    return res.status(501).send({ msg: err });
  }
};

exports.getnotification = async (req, res) => {
  try {
    const userId = req.query.Id;
    const notification = await common.GetRecords("Notification", "", {
      userId,
    });
    if (notification.status === 200) {
      return res
        .status(200)
        .send({ status: 200, notification: notification.data });
    } else {
      res
        .status(500)
        .send({ msg: "Facing Error while fetching notifications" });
    }
  } catch (err) {}
};

exports.getResult = async (req, res) => {
  try {

   
    const results = await common.GetRecords("Result","","");
 
    res.status(200).send({"results":results});
  } catch (err) {
   
    res.status(500).send({ msg: "Error fetching results" });
  }
};

exports.getrelevant = async (req, res) => {
  const userName = req.query.userName;
  const userId = req.query.userId;
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const sql = `SELECT *
    FROM Post
    WHERE userName IN (
        SELECT Username
        FROM User
        WHERE ID IN (
            SELECT Follow_id
            FROM Follow
            WHERE userName = '${userName}'
        )
    ) AND userName NOT IN (
      SELECT BlockedUserName
      FROM Block
      WHERE UserId = ${userId}
    )
    ORDER BY date DESC, LikesCount DESC, CommentCount DESC
    LIMIT ${limit} OFFSET ${offset};
  `;

  try {
    let getUser = await common.customQuery(sql);

    if (getUser.data.length > 0) {
      let response = {
        status: 200,
        msg: "Data Available",
        data: getUser.data,
      };
      res.send(response);
    } else {
      let response = {
        status: 500,
        msg: "No data available",
      };
      res.send(response);
    }
  } catch (err) {
    let response = {
      status: 500,
      msg: "Error fetching data",
      error: err,
    };
    res.send(response);
  }
};


exports.balance = async (req, res) => {
  try {
    const { userId } = req.query;
    const getbalance = await common.GetRecords("Wallet", "", { userId });
    if (getbalance.status) {
      return res.send({ status: 200, balance: getbalance.data[0] }).status(200);
    } else return res.send({ status: 405, balance: 0 });
  } catch (err) {
    return res.status(500).send({
      status: 500,
      msg: "Getting error while fetching the result for the wallet balance",
    });
  }
};

exports.walletotp = async (req, res) => {};

exports.correctdate = async (req, res) => {
  const postquery = "Select date F";
};

exports.deleteusertemplate = async (req, res) => {
  try {
    await common.deleteRecords("User_Template", `Id = ${req.query.Id}`);
    res.status(200).send({ msg: "Deleted Successfully" });
  } catch (err) {
    res.status(500).send({ msg: "Facing Error in Deleting" });
  }
};

exports.deleteuser = async (req, res) => {
  try {
    await common.deleteRecords("User", `Id=${req.query.Id}`);
    await common.deleteRecords("Post", `userName=${req.query.userName}`);
    res.status(200).send({ msg: "Deleted User Successfully" });
  } catch (err) {
    res.status(500).send({ msg: "Cannot Delete" });
  }
};



