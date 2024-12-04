import getCurrentDateTime from "./datetime";
import { AddRecords, customQuery, GetRecords, deleteRecords, Update } from "../common/common";
import { post } from "../routes/app";
import response from "../constant/response";
import { execute } from "../config/db";
import { getMessaging } from "firebase-admin/messaging";
import { initializeApp, credential as _credential } from "firebase-admin";
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

initializeApp({
  credential: _credential.cert(serviceAccount)
});


export async function postComment(req, res) {
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

    let addRecord = await AddRecords("Comment", addobj);

    if (addRecord) {
      let sqlupdate = `UPDATE Post
      SET CommentCount = CommentCount + 1 Where Id=${Post_Id};
      `;
      await customQuery(sqlupdate);

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

export async function getAllComments(req, res) {
  try {
    let Post_Id = req.query.post_id;

    const commentdetails = await GetRecords("Comment", "", { Post_Id });

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

export async function hitlike(req, res) {
 

  try {
    const { postId, userId, userName } = req.body;
    const obj = {
      postId,
      userId,
      userName,
    };
 
    const addedlikes = await AddRecords("Likes", obj);
 
    let sql = `SELECT User.ProfileDp FROM User Where User.userName = '${userName}';`;
    const getdp = await customQuery(sql);
    

    if (addedlikes.status == 1) {
      let sqlupdate = `UPDATE Post
       SET LikesCount = LikesCount + 1 Where Id=${postId};
       `;
      await customQuery(sqlupdate);
      let Dp;
      if (getdp.status == 200) {
        Dp = getdp.data[0].ProfileDp;
      } else {
        Dp = "";
      }

      let usersql = `SELECT User.Id FROM User WHERE User.userName = (SELECT Post.userName FROM Post WHERE Id = ${postId})`;
      const getuserId = await customQuery(usersql);
     
      const noti = {
        msg: `${userName} Liked  your Post`,
        userId: getuserId.data[0].Id,
        Dp,
      };
     
      const notisend = await AddRecords("Notification", noti);

     
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
export async function getlike(req, res) {
  try {
   
    const postId = req.query.postId;

    const getlikes = await GetRecords("Likes", "", { postId });
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

export async function userlike(req, res) {
  try {
   
    const userName = req.query.userName;
    const getlikes = await GetRecords("Likes", "", userName);
   
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

export async function unlike(req, res) {
  try {
    const { postId, userId } = req.query;
   
    const sql = `DELETE FROM Likes
    WHERE postId = ${postId}
    AND userId = ${userId};
    `;

    
    let unlikeuser = await customQuery(sql);
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

    const deltelike = await customQuery(sqlupdate);
 
    let response = {
      status: 200,
      msg: "Unliked  successfully.",
    };
    res.send(response);
  } catch (err) {
    return res.status(501).send({ msg: "Error while fetching data" });
  }
}

export async function getfollowuserName(req, res) {
  try {
    const userName = req.query.userName;
    const sql = `SELECT userName 
    FROM User 
    WHERE Id IN (SELECT Follow_id FROM Follow WHERE userName = '${userName}')
     `;

    let getUser = await customQuery(sql);

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

export async function getcontest(req, res) {
  try {
    const getcontest = await GetRecords("Contest", "", "");
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

export async function deletecontest(req, res) {
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

export async function gettrendingtemplate(req, res) {
  try {
    const gettrendtemp = await GetRecords("Trending_Template", "", "");
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


export async function getmemetemplate(req, res) {
  try {
    const { name } = req.query;
    console.log(name,req.query,req.params)

    const gettrendtemp = await GetRecords("Template_Image", "", {name} );
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


export async function hide(req, res) {
  const { PostId, UserId } = req.body;
 
  const result = await AddRecords("Hide_Post", req.body);
  if (result.status == 1) {
    console.log("Added Successfully");
    return res.status(200).send({ msg: "added" });
  } else return res.status(501).send({ Msg: "Facing Prblem" });
}

export async function blockuser(req, res) {

  const result = await AddRecords("Block", req.body);
  if (result.status == 1) {
   
    return res.status(200).send({ msg: "added" });
  } else return res.status(501).send({ Msg: "Facing Prblem" });
}

export async function allpost(req, res) {

  const postdetails = await GetRecords("Post", "", { Status: 0 });
  return res.status(200).send({ data: postdetails.data });
}

export async function updatepost(req, res) {
  try {
    const Id = req.body.Id;
    const sql = `Update Post SEt Status=1 where Id=${Id}`;
    const updatedetail = await customQuery(sql);
    return res.status(200).send({ msg: "Update Done Successfully" });
  } catch (err) {
    return res.send(500).send({ msg: "Not updated" });
  }
}

export async function delpost(req, res) {
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

export async function getBrandCampaign(req, res) {
 
  try {
    const sql =  "SELECT * FROM `Campaign` WHERE `campaign_name` =(Select `campaign_name` From `BrandInfo` where `Id` = ?)"
    const [rows] = await execute(sql, [req.query.Id]);
    
   
    return res.json({ status: 200, campaigndetails: rows });
  } catch (err) {
    return res.status(500).json({ Error: err });
  }
}

export async function contestapplicants(req, res) {
 
  const contestName = req.query.Id;
  try {
    const getdetails = await customQuery(
      `SELECT * FROM Contest_Apply WHERE contestName = (SELECT contestName FROM Contest WHERE Id = ${contestName});`

    );

    if (getdetails.status == 200) {
      return res.status(200).send({ status: 200, applicants: getdetails.data });
    }
  } catch (err) {
   
    res.status(500).send({ msg: "Cannot get the applicants result" });
  }
}

export async function getalltemplates(req, res) {
  try {
    const getdetails = await GetRecords("User_Template", "", "");

    if (getdetails.status == 200) {
      return res.status(200).send({ status: 200, templates: getdetails.data });
    }
  } catch (err) {
   
    res.status(500).send({ msg: "Cannot get the applicants result" });
  }
}

export async function updatetemplate(req, res) {
  try {
    const Id = req.body.Id;
    const sql = `Update User_Template Set Approval=1 where Id=${Id}`;
    const updatedetail = await customQuery(sql);
    return res.status(200).send({ msg: "Update Done Successfully" });
  } catch (err) {
    return res.send(500).send({ msg: "Not updated" });
  }
}

export async function deltemplate(req, res) {
  try {
    const Id = req.body.Id;
    const deletedetail = await deleteRecords(
      "User_Template",
      `Id = ${Id}`
    );
    if (deletedetail.status == 1) {
      return res.status(200).send({ msg: "Delete Done Successfully" });
    } else {
      return res.send(401).send({ msg: "Not Deleted" });
    }
  } catch (err) {
    return res.send(500).send({ msg: "Not Deleted" });
  }
}

export async function saveResult(req, res) {
  try {


    const data = { Array: req.body.data["Array"] };
   
    const newRecord = {
      campaign: req.body.campaign,
      data: JSON.stringify(data), // Convert data to JSON string if the column type is TEXT or VARCHAR
      Name: req.body.Name
    };
   

    await AddRecords("Result", newRecord);
    res.status(200).send({ msg: "Declared Result Successfully" });
  } catch (err) {
    console.error('Error in saving result:', err.message); // Log the error message
    res.status(500).send({ msg: "Error in saving result" });
  }
}


export async function getallusers(req, res) {
  try {
    const getdetails = await GetRecords("User", "", "");

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

export async function support(req, res) {
  try {
    const getdetails = await GetRecords("Support", "", "");

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

export async function updatecontest(req, res) {
  
  const updateobj = {
    contestName:req.body.contestName,
    Description:req.body.Description,
    time_limit:req.body.time
  }
  try {
    await Update("Contest",updateobj,req.params.Id)
    return res.status(200).send({msg:"Updated Successfully"})
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: "Failed to Update Details" });
  }
}


export async function notification(req,res){
 
// const registrationToken = 'dfl97H9VTeuzdzwquLsL76:APA91bErEZ9V79-hl5pRv4twZmCdjYKnZcPe7n15B6l25FB21Tp9mO-Hpf5Qqjs3jsZHRswJrze2GlChQ3k1ZJSOWKR7xOzTtmb2wPk4wW0gOpzZi6KNcOM62dmkqiYoNke-97eQzh1h';
//const registrationToken='evoomBfLSaWA2pgHzaPXXX:APA91bGmEb5uRuXJZzvRlNP8-H3WAZwiNshpt3g69uoswfGTMlprTtpJKENfUyRPkfFOLjvju3k24McFpTtVS8r_ZW0m83-_QX5Dux-O5sc8vyzG9s-LKUuY_VsaPeGt_PcF2avvQ6ii'
//const registrationToken= 'fh3ApEF5Szih5V7B65TDln:APA91bFNLrPpDm-FQSecdJUgzHMVFiNK1bc12CdpYBweP7Ie-v1RJx27aCJZRDNZN2ccmTnsiLpmCDai5h5heiCIERMa-8SAj56lPPoEdedEEXUwreuRh5s1ZOSf17XbntFTiOD2JJ2l'  
console.log('heyyyyyy')
const registrationToken='fxfPndB-Ro2Wx5CEQ0obj4:APA91bEyaXSkDnWQI4jqXfAYCR_mgAaWwSWUvKnlBOwi9ktnARM0MPEarC5D65PV3HIIt5MYrgskIqh1j15EMhBS2AVpUhnkDnux_Gdb2qfkucKjOM3ekfUXy4pM5HV92-3PVxzB14hl'
const message = {
    notification: {
      title: req.body.title,
      body: req.body.body,
    },
    token: registrationToken,
  };

  getMessaging().send(message)
    .then((response) => {
      
      res.status(200).send('Successfully sent message: ' + response);
    })
    .catch((error) => {
      
      res.status(500).send('Error sending message: ' + error);
    });


}

export async function report(req,res){

 try{
  await customQuery(`UPDATE Post SET Status=0  WHERE Id= ${req.body.Id}`)
  return res.send({msg:"Reported Successfully"})
 }
catch(err){
  console.log(err,'facingg')
  return res.status(500).send({msg:"Facing Problem"})
}
}

