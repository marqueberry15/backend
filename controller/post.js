const getCurrentDateTime = require("./datetime");
const common = require("../common/common");
const { post } = require("../routes/app");

exports.postComment = async (req, res) => {
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
};

exports.getAllComments = async (req, res) => {
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
};

exports.hitlike = async (req, res) => {
  console.log("hittt like");

  try {
    const { postId, userId, userName } = req.body;
    const obj = {
      postId,
      userId,
      userName,
    };
    console.log("hittt like");
    const addedlikes = await common.AddRecords("Likes", obj);
    console.log("hittt like", addedlikes);

    let sql = `SELECT User.ProfileDp FROM User Where User.userName = '${userName}';`;
    const getdp = await common.customQuery(sql);
    console.log("getting dp responseeeee issssss", getdp);

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
      console.log("getuserIddd ", getuserId);
      console.log("usersql statment", usersql);
      const noti = {
        msg: `${userName} Liked  your Post`,
        userId: getuserId.data[0].Id,
        Dp,
      };
      console.log("notification object isss ", noti);
      const notisend = await common.AddRecords("Notification", noti);

      console.log("hittt like");
      if (notisend.status) {
        console.log("hittt like");

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
};
exports.getlike = async (req, res) => {
  try {
    console.log("");
    const postId = req.query.postId;
    
    const getlikes = await common.GetRecords("Likes", "", { postId });
    if (getlikes.status == 200) {

      console.log("no. of likesss areee", getlikes.data.length);

      return res.status(200).send({ status: 200, likes: getlikes.data });
    } else
      return res
        .status(401)
        .send({ status: 401, msg: "Cannot get likes record" });

    // const sql = `select top(3) From User Where User.Id In (Select User.Id from Likes where postId=${postId})`;
    // const sql= `SELECT TOP 3 ProfileDp
    // FROM User
    // WHERE User.Id IN (SELECT User.Id FROM Likes WHERE postId=${postId})
    // `
    // const result = await common.customQuery(sql);
    // console.log(result, "resultttttt");
  } catch (err) {
    return res
      .status(501)
      .send({ msg: "Error while fetching the  likes data" });
  }
};

exports.userlike = async (req, res) => {
  try {
    console.log("get user like");
    const userName = req.query.userName;
    const getlikes = await common.GetRecords("Likes", "", userName);
    console.log("get likesss", getlikes);
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
};

exports.unlike = async (req, res) => {
  try {
    const { postId, userId } = req.query;
    console.log("postttttt idddddddd", postId, userId);
    const sql = `DELETE FROM Likes
    WHERE postId = ${postId}
    AND userId = ${userId};
    `;

    console.log("sql is s ", sql);

    let unlikeuser = await common.customQuery(sql);
    console.log("unlikeee userrrrrrrrrrrr", unlikeuser);
    // if (unlikeuser.status==1) {
    // console.log("iff condition satisfied")

    //   let sqlupdate = `UPDATE Post
    //   SET LikesCount = LikesCount - 1
    //   WHERE Id = ${postId}`;

    //   const deltelike=await common.customQuery(sqlupdate);
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
    console.log("delte likee isss", deltelike);
    let response = {
      status: 200,
      msg: "Unliked  successfully.",
    };
    res.send(response);
  } catch (err) {
    return res.status(501).send({ msg: "Error while fetching data" });
  }
};

exports.getfollowuserName = async (req, res) => {
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
};

exports.getcontest = async (req, res) => {
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
};

exports.deletecontest = async (req, res) => {
  try {
    const { Id } = req.query;
    const deletecontest = await common.deleteRecords("Contest", { Id });
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
};

exports.gettrendingtemplate = async (req, res) => {
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
};
