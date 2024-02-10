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
  
    const Date= `${date}_${time}`

    let addobj = {
      text,
      reply,
      Post_Id,
      Date,
      userName,
      profile

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

      const commentdetails = await common.GetRecords("Comment", "", {Post_Id});
  
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

  
  

