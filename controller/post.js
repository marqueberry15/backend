const getCurrentDateTime = require("./datetime")
const common = require("../common/common");
const { post } = require("../routes/app");
const response = require("../constant/response");
const connectDB = require("../config/db")
const { getMessaging } = require("firebase-admin/messaging");
var admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.postComment = async(req, res)=> {
  try {
    let text = req.body.text;
    let reply = req.body.parent_id;
    let Post_Id = req.body.post_Id;
    let userName = req.body.user;
    let profile = req.body.profile;
    let { date, time } = getCurrentDateTime();

    const Date = `${date}_${time}`;

    let addobj = {
      text,
      reply,
      Post_Id,
      Date,
      userName,
      profile,
    };

    let addRecord = await common.AddRecords("Comment", addobj);

    if (addRecord) {
      let sqlupdate = `UPDATE Post
      SET CommentCount = CommentCount + 1 Where Id=${Post_Id};
      `;
      await common.customQuery(sqlupdate);

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
  } catch (err) {
    console.error(err);
    let response = {
      status: 500,
      msg: "Internal server error",
    };
    res.send(response);
  }
}

exports.getAllComments = async(req, res)=> {
  try {
    let Post_Id = req.query.post_id;

    const commentdetails = await common.GetRecords("Comment", "", { Post_Id });

    if (commentdetails.status === 200) {
      let comments = commentdetails.data;
      let response = {
        status: 200,
        comments: comments,
      };

      res.send(response);
    } else {
      let response = {
        status: 404,
        msg: "No comments found for the given post",
      };
      res.send(response);
    }
  } catch (err) {
    console.error(err);
    let response = {
      status: 500,
      msg: "Internal server error",
    };
    res.send(response);
  }
}

exports.hitlike = async(req, res)=> {
  try {
    const { postId, userId, userName } = req.body;
    const obj = {
      postId,
      userId,
      userName,
    };

    const addedlikes = await common.AddRecords("Likes", obj);

    let sql = `SELECT User.ProfileDp FROM User Where User.userName = '${userName}';`;
    const getdp = await common.customQuery(sql);

    if (addedlikes.status == 1) {
      let sqlupdate = `UPDATE Post
       SET LikesCount = LikesCount + 1 Where Id=${postId};
       `;
      await common.customQuery(sqlupdate);
      let Dp;
      if (getdp.status == 200) {
        Dp = getdp.data[0].ProfileDp;
      } else {
        Dp = "";
      }

      let usersql = `SELECT User.Id FROM User WHERE User.userName = (SELECT Post.userName FROM Post WHERE Id = ${postId})`;
      const getuserId = await common.customQuery(usersql);

      const noti = {
        msg: `${userName} Liked  your Post`,
        userId: getuserId.data[0].Id,
        Dp,
      };

      const notisend = await common.AddRecords("Notification", noti);

      if (notisend.status) {
        return res
          .status(200)
          .send({ msg: "Contest Created Successfully", status: 200 });
      }
    } else {
      return {
        status: 401,
        msg: "Failed to update the like",
      };
    }
  } catch (err) {
    return {
      status: 500,
      msg: err,
    };
  }
}
exports.getlike = async(req, res) => {
  try {
    const postId = req.query.postId;

    const getlikes = await common.GetRecords("Likes", "", { postId });
    if (getlikes.status == 200) {
      return res.status(200).send({ status: 200, likes: getlikes.data });
    } else
      return res
        .status(401)
        .send({ status: 401, msg: "Cannot get likes record" });
  } catch (err) {
    return res
      .status(501)
      .send({ msg: "Error while fetching the  likes data" });
  }
}

exports.userlike= async(req, res)=> {
  try {
    const userName = req.query.userName;
    const getlikes = await common.GetRecords("Likes", "", userName);

    if (getlikes.status == 200) {
      return res.status(200).send({ status: 200, likes: getlikes.data });
    } else
      return res
        .status(200)
        .send({ status: 401, msg: "Cannot get likes record" });
  } catch (err) {
    return res
      .status(501)
      .send({ msg: "Error while fetching the  likes data" });
  }
}

exports.unlike = async(req, res) => {
  try {
    const { postId, userId } = req.query;

    const sql = `DELETE FROM Likes
    WHERE postId = ${postId}
    AND userId = ${userId};
    `;

    let unlikeuser = await common.customQuery(sql);
    // if (unlikeuser.status==1) {
    // console.log("iff condition satisfied")

    //   let sqlupdate = `UPDATE Post
    //   SET LikesCount = LikesCount - 1
    //   WHERE Id = ${postId}`;

    //   const deltelike=await common.common.customQuery(sqlupdate);
    //   console.log('delte likee isss',deltelike)
    //   let response = {
    //     status: 200,
    //     msg: "Unliked  successfully.",
    //   };
    //   res.send(response);
    // } else {
    //   let response = {
    //     status: 500,
    //     msg: "Something went wrong",
    //   };
    //   res.send(response);
    // }

    let sqlupdate = `UPDATE Post
      SET LikesCount = LikesCount - 1
      WHERE Id = ${postId}`;

    const deltelike = await common.customQuery(sqlupdate);

    let response = {
      status: 200,
      msg: "Unliked  successfully.",
    };
    res.send(response);
  } catch (err) {
    return res.status(501).send({ msg: "Error while fetching data" });
  }
}

exports.getfollowuserName = async(req, res)=> {
  try {
    const userName = req.query.userName;
    const sql = `SELECT userName 
    FROM User 
    WHERE Id IN (SELECT Follow_id FROM Follow WHERE userName = '${userName}')
     `;

    let getUser = await common.customQuery(sql);

    if (getUser.status) {
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
    res.status(500).send({ msg: err });
  }
}

exports.getcontest = async(req, res)=> {
  try {
    const getcontest = await common.GetRecords("Contest", "", "");
    if (getcontest.status)
      return res.send({
        msg: "contest details are fetched successfully",
        status: 200,
        contest: getcontest.data,
      });
    else
      return res.send({ msg: "Failed to fetch contest details ", status: 401 });
  } catch (err) {
    return res.status(501).send({ msg: `Facing Error, ${err}`, status: "501" });
  }
}

exports.deletecontest= async(req, res)=> {
  try {
    const { Id } = req.query;
    const deletecontest = await deleteRecords("Contest", { Id });
    if (deletecontest.status) {
      return res.status(200).send({ msg: "Deleted Successfully", status: 200 });
    } else
      return res.status(401).send({
        msg: "Faced an error while deleting the Contest",
        status: 401,
      });
  } catch (err) {
    return res.status(501).send({ msg: `Faced an Error : ${err}` });
  }
}

exports.gettrendingtemplate = async(req, res) => {
  try {
    const gettrendtemp = await common.GetRecords("Trending_Template", "", "");
    if (gettrendtemp.status)
      return res.status(200).send({
        msg: "Trending Templates are fetched Completely",
        status: 200,
        trendingtemplate: gettrendtemp.data,
      });
  } catch (err) {
    return res.status(501).send({ msg: `Facing Error, ${err}`, status: "501" });
  }
}

exports.getmemetemplate = async(req, res) => {
  try {
    const { name } = req.query;
    console.log(name, req.query, req.params);

    const gettrendtemp = await common.GetRecords("Template_Image", "", { name });
    if (gettrendtemp.status)
      return res.status(200).send({
        msg: "Trending Templates are fetched Completely",
        status: 200,
        trendingtemplate: gettrendtemp.data,
      });
  } catch (err) {
    return res.status(501).send({ msg: `Facing Error, ${err}`, status: "501" });
  }
}

exports.hide = async(req, res) => {
  const { PostId, UserId } = req.body;

  const result = await common.AddRecords("Hide_Post", req.body);
  if (result.status == 1) {
    console.log("Added Successfully");
    return res.status(200).send({ msg: "added" });
  } else return res.status(501).send({ Msg: "Facing Prblem" });
}

exports.blockuser = async(req, res) => {
  const result = await common.AddRecords("Block", req.body);
  if (result.status == 1) {
    return res.status(200).send({ msg: "added" });
  } else return res.status(501).send({ Msg: "Facing Prblem" });
}

exports.allpost= async(req, res)=> {
  const postdetails = await common.GetRecords("Post", "", { Status: 0 });
  return res.status(200).send({ data: postdetails.data });
}

exports.updatepost = async(req, res)=> {
  try {
    const Id = req.body.Id;
    const sql = `Update Post SEt Status=1 where Id=${Id}`;
    const updatedetail = await common.customQuery(sql);
    return res.status(200).send({ msg: "Update Done Successfully" });
  } catch (err) {
    return res.send(500).send({ msg: "Not updated" });
  }
}

exports.delpost= async(req, res)=> {
  try {
    const Id = req.query.Id;
    const deletedetail = await deleteRecords("Post", `Id = ${Id}`);

    if (deletedetail.status == 1) {
      return res.status(200).send({ msg: "Delete Done Successfully" });
    } else {
      return res.send(401).send({ msg: "Not Deleted" });
    }
  } catch (err) {
    return res.send(500).send({ msg: "Not Deleted" });
  }
}

exports.getBrandCampaign= async(req, res)=> {
  try {
    const sql =
      "SELECT * FROM `Campaign` WHERE `campaign_name` =(Select `campaign_name` From `BrandInfo` where `Id` = ?)";
    const [rows] = await connectDB.execute(sql, [req.query.Id]);

    return res.json({ status: 200, campaigndetails: rows });
  } catch (err) {
    return res.status(500).json({ Error: err });
  }
}

exports.contestapplicants = async(req, res)=> {
  const contestName = req.query.Id;
  try {
    const getdetails = await common.customQuery(
      `SELECT * FROM Contest_Apply WHERE contestName = (SELECT contestName FROM Contest WHERE Id = ${contestName});`
    );

    if (getdetails.status == 200) {
      return res.status(200).send({ status: 200, applicants: getdetails.data });
    }
  } catch (err) {
    res.status(500).send({ msg: "Cannot get the applicants result" });
  }
}

exports .getalltemplates= async(req, res)=> {
  try {
    const getdetails = await common.GetRecords("User_Template", "", "");

    if (getdetails.status == 200) {
      return res.status(200).send({ status: 200, templates: getdetails.data });
    }
  } catch (err) {
    res.status(500).send({ msg: "Cannot get the applicants result" });
  }
}

exports.updatetemplate =async (req, res) => {
  try {
    const Id = req.body.Id;
    const sql = `Update User_Template Set Approval=1 where Id=${Id}`;
    const updatedetail = await common.customQuery(sql);
    return res.status(200).send({ msg: "Update Done Successfully" });
  } catch (err) {
    return res.send(500).send({ msg: "Not updated" });
  }
}

exports.deltemplate = async(req, res) =>{
  try {
    const Id = req.body.Id;
    const deletedetail = await deleteRecords("User_Template", `Id = ${Id}`);
    if (deletedetail.status == 1) {
      return res.status(200).send({ msg: "Delete Done Successfully" });
    } else {
      return res.send(401).send({ msg: "Not Deleted" });
    }
  } catch (err) {
    return res.send(500).send({ msg: "Not Deleted" });
  }
}

exports.saveResult= async(req, res)=> {
  try {
    const data = { Array: req.body.data["Array"] };

    const newRecord = {
      campaign: req.body.campaign,
      data: JSON.stringify(data), // Convert data to JSON string if the column type is TEXT or VARCHAR
      Name: req.body.Name,
    };

    await common.AddRecords("Result", newRecord);
    res.status(200).send({ msg: "Declared Result Successfully" });
  } catch (err) {
    console.error("Error in saving result:", err.message); // Log the error message
    res.status(500).send({ msg: "Error in saving result" });
  }
}

exports.getallusers= async(req, res) => {
  try {
    const getdetails = await common.GetRecords("User", "", "");

    if (getdetails.status == 200) {
      return res.status(200).send({ status: 200, templates: getdetails.data });
    } else
      return res
        .status(401)
        .send({ msg: "Facing error in fetching the details" });
  } catch (err) {
    console.log("errror is ", err);
    return res
      .status(500)
      .send({ msg: "Facing error in fetching the details" });
  }
}

exports.support = async(req, res) => {
  try {
    const getdetails = await common.GetRecords("Support", "", "");

    if (getdetails.status == 200) {
      return res.status(200).send({ status: 200, queries: getdetails.data });
    } else
      return res
        .status(401)
        .send({ msg: "Facing error in fetching the details" });
  } catch (err) {
    console.log("errror is ", err);
    return res
      .status(500)
      .send({ msg: "Facing error in fetching the details" });
  }
}

exports.updatecontest = async(req, res)=> {
  const updateobj = {
    contestName: req.body.contestName,
    Description: req.body.Description,
    time_limit: req.body.time,
  };
  try {
    await Update("Contest", updateobj, req.params.Id);
    return res.status(200).send({ msg: "Updated Successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: "Failed to Update Details" });
  }
}

exports.notification = async(req, res)=> {
  // const registrationToken = 'dfl97H9VTeuzdzwquLsL76:APA91bErEZ9V79-hl5pRv4twZmCdjYKnZcPe7n15B6l25FB21Tp9mO-Hpf5Qqjs3jsZHRswJrze2GlChQ3k1ZJSOWKR7xOzTtmb2wPk4wW0gOpzZi6KNcOM62dmkqiYoNke-97eQzh1h';
  //const registrationToken='evoomBfLSaWA2pgHzaPXXX:APA91bGmEb5uRuXJZzvRlNP8-H3WAZwiNshpt3g69uoswfGTMlprTtpJKENfUyRPkfFOLjvju3k24McFpTtVS8r_ZW0m83-_QX5Dux-O5sc8vyzG9s-LKUuY_VsaPeGt_PcF2avvQ6ii'
  //const registrationToken= 'fh3ApEF5Szih5V7B65TDln:APA91bFNLrPpDm-FQSecdJUgzHMVFiNK1bc12CdpYBweP7Ie-v1RJx27aCJZRDNZN2ccmTnsiLpmCDai5h5heiCIERMa-8SAj56lPPoEdedEEXUwreuRh5s1ZOSf17XbntFTiOD2JJ2l'
  console.log("heyyyyyy");
  const registrationToken =
    "fxfPndB-Ro2Wx5CEQ0obj4:APA91bEyaXSkDnWQI4jqXfAYCR_mgAaWwSWUvKnlBOwi9ktnARM0MPEarC5D65PV3HIIt5MYrgskIqh1j15EMhBS2AVpUhnkDnux_Gdb2qfkucKjOM3ekfUXy4pM5HV92-3PVxzB14hl";
  const message = {
    notification: {
      title: req.body.title,
      body: req.body.body,
    },
    token: registrationToken,
  };

  getMessaging()
    .send(message)
    .then((response) => {
      res.status(200).send("Successfully sent message: " + response);
    })
    .catch((error) => {
      res.status(500).send("Error sending message: " + error);
    });
}

exports.report = async(req, res)=> {
  try {
    await common.customQuery(`UPDATE Post SET Status=0  WHERE Id= ${req.body.Id}`);
    return res.send({ msg: "Reported Successfully" });
  } catch (err) {
    console.log(err, "facingg");
    return res.status(500).send({ msg: "Facing Problem" });
  }
}
