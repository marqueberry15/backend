const getCurrentDateTime = require("./datetime");
const common = require("../common/common");
const config = require("../config/config");
// const ffmpeg = require('ffmpeg');
const connectDB = require("../config/db");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const thumbsupply = require("thumbsupply");
const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const path = require("path");

// const configr = {
//   host: "154.41.233.75",
//   port: process.env.ftpport,
//   user: "u394360389.Admin",
//   password: process.env.ftppassword,
// };

// const configur = {
//   host: process.env.ftphost,
//   port: process.env.ftpport,
//   user: process.env.ftpuser,
//   password: process.env.ftppassword,
// };

// async function connectFTP(buffer, fileName, folder) {
//   const client = new ftp.Client();
//   const readableStream = new PassThrough();
//   readableStream.end(buffer);
//   try {
//     await client.access(configr);

//     await client.cd(folder);

//     await client.uploadFrom(readableStream, fileName, { overwrite: true });

//     client.close();
//     return 1;
//   } catch (err) {
//     client.close();
//     return 0;
//   }
// }

const AWS = require("aws-sdk");

// Configure the AWS SDK to use environment variables
const s3 = new AWS.S3({
  region: process.env.region,
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  //endpoint: `https://s3.${process.env.region}.amazonaws.com`
});

// Example function to upload a file to S3
async function uploadToS3(buffer, fileName, path) {
  const params = {
    Bucket: "adoro-data-storage",
    Key: `${path}/${fileName}`,
    Body: buffer,
    // ContentType: 'image/jpeg',
  };

  try {
    await s3.upload(params).promise();
    console.log("tttttttttttttt", params);
    console.log("File uploaded successfully");
    return 1;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return 0;
  }
}

exports.updateprofile = async (req, res) => {
  try {
    const { date, time } = getCurrentDateTime();
    const fileName = `${date}_${time}`;
    const result = await uploadToS3(
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

    const result = await uploadToS3(req.file.buffer, fileName, "UserPost");

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
    console.log("ggggggggggggggggggggg", userId, limit, offset);

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
    ORDER BY (LikesCount + CommentCount) / 2.0 DESC, date DESC
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

    const postdetails = await common.GetRecords("Post", "", "");
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
    const result = await uploadToS3(file.buffer, fileName, "UserPost");
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
    const result = await uploadToS3(file.buffer, fileName, "TrendingTemplate");
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
    const result = await uploadToS3(req.file.buffer, fileName, "UserWallpaper");
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

    const result = await uploadToS3(req.file.buffer, fileName, "UserTemplate");

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
    const { campaign_name, userName, mobileNo } = req.body;

    if (!req.file || !req.file.buffer) {
      return res.status(400).send({ msg: "File is missing in the request" });
    }

    if (!campaign_name || typeof campaign_name !== "string") {
      return res.status(400).send({ msg: "Invalid campaign_name provided" });
    }

    const fileName = `${date}_${time}_${campaign_name}`;
    const fileBuffer = req.file.buffer;

    // Upload the file to S3
    const s3Result = await uploadToS3(fileBuffer, fileName, "Campaign");

    if (!s3Result) {
      return res.status(500).send({ msg: "Failed to upload file to S3" });
    }

    // Insert the campaign data into the database
    const insertQuery = `
      INSERT INTO Campaign (campaign_name, fileName, type, time, userName, mobileNo) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await connectDB.query(insertQuery, [
      campaign_name,
      fileName,
      req.file.mimetype,
      time,
      userName,
      mobileNo,
    ]);

    // Update applicant count for the campaign
    const updateQuery = `
      UPDATE BrandInfo
      SET applicant = applicant + 1 
      WHERE campaign_name = ?;
    `;

    const [updateResult] = await connectDB.query(updateQuery, [campaign_name]);

    // Check if any rows were affected
    if (updateResult.affectedRows === 0) {
      return res.status(404).send({ msg: `Campaign "${campaign_name}" not found for update` });
    }

    return res.send({
      status: 200,
      msg: "Picture Uploaded Successfully",
      file: fileName,
    });
  } catch (err) {
    console.error("Error occurred:", err);
    return res.status(500).send({
      msg: "Internal Server Error",
      error: err.message,
    });
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
    const result = await uploadToS3(req.file.buffer, fileName, "Contest");

    const contestobj = {
      Description,
      contestName,
      fileName,
      date: `${date}_${time}`,
      time_limit: req.body.time,
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
    const { contestName, userName, mobileNo } = req.body;

    const fileName = `${date}_${time}_${userName}`;

    const result = await uploadToS3(req.file.buffer, fileName, "ContestApply");
    console.log("hhhhhhhh", result);

    if (result) {
      const updatedUser = await common.AddRecords("Contest_Apply", {
        fileName,
        contestName,
        time,
        type: req.file.mimetype,
        userName,
        mobileNo,
      });
      if (updatedUser) {
        let sqlupdate = `UPDATE Contest
        SET applicant = applicant + 1 Where contestName='${contestName}';
        `;
        await common.customQuery(sqlupdate);
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
    const results = await common.GetRecords("Result", "", "");

    res.status(200).send({ results: results });
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
   ORDER BY (LikesCount + CommentCount) / 2.0 DESC, date DESC
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
    console.log("jjjjjjjjjjj", req.query);
    const { userId } = req.query;
    console.log("hhhhhhhhhhhhhhh", userId);
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

// exports.makeinvoice = async(req,res)=>{
//   try {
//     // Read the PDF template
//     const templatePath = path.join(__dirname, '..', 'public', 'bill.pdf');
//    // const templatePath = require("../public/bill.pdf"); // Replace with your template path
//    // const templatePath = path.join(__dirname, 'public', 'bill.pdf'); // Replace with your template path

//     // Read the PDF template as a binary buffer
//     const pdfBuffer = fs.readFileSync(templatePath);

//     // Load the PDF with pdf-lib
//     const pdfDoc = await PDFDocument.load(pdfBuffer);

//     // Get the form fields
//     const form = pdfDoc.getForm();
//     //const form = pdfDoc.getForm();

//     // Get all fields in the form
//     const fields = form.getFields();

//     // Log and collect field names
//     const fieldNames = fields.map(field => field.getName());
//     console.log('Field Names in PDF:', fieldNames);

//     // Fill the form fields using data from the request body
//     const { name} = req.body; // Add more fields as required
//     form.getTextField('nameField').setText(name); // Replace 'name' with the field name in your template
//     // form.getTextField('email').setText(email);
//     // form.getTextField('address').setText(address);

//     // Flatten the form (optional, makes fields non-editable)
//     form.flatten();

//     // Serialize the filled PDF to bytes
//     const filledPdfBytes = await pdfDoc.save();

//     // Set response headers for download
//     res.setHeader('Content-Disposition', 'attachment; filename="filled-form.pdf"');
//     res.setHeader('Content-Type', 'application/pdf');

//     // Send the filled PDF as a response
//     res.send(filledPdfBytes);
//   } catch (error) {
//     console.error('Error generating PDF:', error);
//     res.status(500).send('An error occurred while generating the PDF.');
//   }

// }

// Configure AWS SDK

exports.makeinvoice = async (req, res) => {
  try {
    // Read the PDF template
    console.log(1);
    const templatePath = path.join(__dirname, "..", "public", "bill.pdf");
    const pdfBuffer = fs.readFileSync(templatePath);
    console.log(req);

    // Load the PDF with pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Get the form fields
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    // Log and collect field names
    const fieldNames = fields.map((field) => field.getName());
    console.log("Field Names in PDF:", fieldNames);

    const { date, time } = getCurrentDateTime();

    // Extract name from request body and fill the form field
    const { name, description, amt, userName } = req.body;
    form.getTextField("fromField").setText(name);
    form.getTextField("descriptionField").setText(description);
    
    
    form.getTextField("amountField").setText(amt);
    form.getTextField("taxField").setText(0);
    form.getTextField("totalField").setText(amt);
    form.getTextField("dateField").setText(date);

    // Get current date and time

    // Flatten the form (optional, makes fields non-editable)
    form.flatten();

    // Serialize the filled PDF to bytes
    const filledPdfBytes = await pdfDoc.save();

    // S3 upload parameters
    const bucketName = "adoro-data-storage"; 
    const fileName = `${userName}_${date}_${time}.pdf`; 
    const uploadParams = {
      Bucket: bucketName,
      Key: `Invoice/${fileName}`,
      Body: filledPdfBytes,
      ContentType: "application/pdf",
    };

    // Upload the file to S3
    const s3Response = await s3.upload(uploadParams).promise();
    console.log("PDF uploaded to S3:", s3Response.Location);

    const result = await common.AddRecords("invoice", {
      name:userName,
      date,
      fileName,
    });

    // Provide the URL of the uploaded PDF on S3
    res.status(200).json({
      message: "PDF generated and uploaded successfully!",
      downloadUrl: s3Response.Location, // Link to download the PDF
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("An error occurred while generating the PDF.");
  }
};

exports.uploadinvoice = async (req, res) => {
  try {
    console.log(1);
    console.log(2, req.file);

    const fileBuffer = req.file.buffer;
    const { name } = req.body;
    const { date, time } = getCurrentDateTime();
    const fileName = `${name}_${date}_${time}.pdf`;

    const bucketName = "adoro-data-storage"; 
    const uploadParams = {
      Bucket: bucketName,
      Key: `Invoice/${fileName}`,
      Body: fileBuffer,
      ContentType: "application/pdf",
    };
    console.log("s3 isss", s3.region, s3.accessKeyId, s3.secretAccessKey);
    console.log(
      "s3 isss",
      process.env.region,
      process.env.accessKeyId,
      process.env.secretAccessKey
    );

    // Upload the file to S3
    const s3Response = await s3.upload(uploadParams).promise();
    console.log("PDF uploaded to S3:", s3Response.Location);

    // Save file metadata in the database
    const result = await common.AddRecords("invoice", {
      name,
      date,
      fileName,
    });

    res.status(200).json({
      message: "File uploaded and saved successfully!",
      fileUrl: s3Response.Location,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).send("An error occurred while uploading the file.");
  }
};

exports.getverified = async (req, res) => {
  try {
    console.log(req.body);
    const { name, userName, socialLink, uniqueService, charges, otp, lang, nationality} =
      req.body;
    console.log(name, otp);

    if (!userName || !otp) {
      return res.status(400).send("Username and OTP are required.");
    }

    const result = await common.AddRecords("verification", {
      name,
      userName,
      socialLink,
      uniqueService,
      charges,
      otp,
      lang,
      nationality
    });

    console.log(result, "resss");
    // const [result] = await db.execute(query, [username, otp]);

    if (result) {
      return res.status(200).send("User successfully verified.");
      //  res
      //   .status(404)
      //   .send("No matching user found or OTP is incorrect.");
    }

    res.status(404).send("Error in adding data");
  } catch (err) {
    console.error("Error verifying user:", err);
    res.status(500).send("An error occurred while verifying the user.");
  }
};
