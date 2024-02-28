const getCurrentDateTime = require("./datetime");
const common = require("../common/common");
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
  console.log("hitting the like api", req.body);
  try {
    const { postId, userId, userName } = req.body;
    const obj = {
      postId,
      userId,
      userName,
    };
    const addedlikes = await common.AddRecords("Likes", obj);
    console.log("addded likesss are", addedlikes);
    if (addedlikes) {
      return {
        status: 200,
        msg: "Updated the Like",
      };
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
    const getlikes = await common.GetRecords("Likes", "", "");
    if (getlikes.status == 200) {
      console.log("likess are", getlikes.data);
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
};

exports.unlike = async (req, res) => {
  try {
    const { postId, userId } = req.query;
    const unlike = await common.deleteRecords("Likes", { Id });
    if (unlike) {
      let response = {
        status: 200,
        msg: "Unliked  successfully.",
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
    return res.status(501).send({ msg: "Error while fetching data" });
  }
};

exports.getfollowuserName = async (req, res) => {
  try {
    console.log(1, req.query);
    const userName = req.query.userName;
    const sql = `SELECT userName 
    FROM User 
    WHERE Id IN (SELECT Follow_id FROM Follow WHERE userName = '${userName}')
     `;

    let getUser = await common.customQuery(sql);

    console.log("getUserrrr is", getUser);
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
    console.log(1);
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
    console.log("Errro is ", err);
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
    console.log(1);
    const gettrendtemp = await common.GetRecords("Trending_Template", "", "");
    if (gettrendtemp.status)
      return res.send({
        msg: "Trending Templates are fetched Completely",
        status: 200,
        trendingtemplate: gettrendtemp.data,
      });
  } catch (err) {
    console.log("Error is ", err);
    return res.status(501).send({ msg: `Facing Error, ${err}`, status: "501" });
  }
};

exports.createnotification = async (req, res) => {
  try {
    const { text, userId } = req.body;
    const notification = await common.AddRecords("Notification", req.body);
    if (notification.status)
      return res.send({
        msg: "Created notification Successfully",
        status: 200,
      });
    else
      return res.send({
        msg: "Facing problem in creating the notification",
        status: 401,
      });
  } catch (err) {
    console.log("Facing error ", err);
  }
};
