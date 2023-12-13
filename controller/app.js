const common = require("../common/common");
const config = require("../config/config");
const axios = require("axios");
const fs = require("fs").promises;
const { PassThrough } = require("stream");
const jwt = require("jsonwebtoken");
const configr = {
  host: process.env.ftphost,
  port: process.env.ftpport,
  user: "u394360389",
  password: process.env.ftppassword,
};
const moment = require("moment-timezone");

const usersignup = async (mobileNo, fullName, userName, otp) => {


  try {
    const currentDate = new Date();
    const user = await common.GetRecords(config.userTable, "", { mobileNo });
    console.log(user);
    if (user.status) {
      const response = {
        status: 401,
        msg: "Phone No. Already registered.",
      };
      res.send(response);
    }

    const timestamp = currentDate.getTime();
    const created_at = moment()
      .tz("Asia/Kolkata")
      .format("YYYY-MM-DD HH:mm:ss");
    console.log(mobileNo, "mobile Number is");
    const newUser = {
      fullName: fullName,
      userName: userName,
      refer_id: `${userName}_${timestamp}`,
      created_on: created_at,
      mobileNo: mobileNo,
      otp: otp,
    };

    const insertResult = await common.AddRecords(config.userTable, newUser);
    console.log(insertResult, insertResult.data);

    if (insertResult.status) {
      return insertResult;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error in usersignup:", error.message);
    return null;
  }
};
const login = async (req, res) => {
  try {
    console.log(1);
    const mobileNo = req.body.mobileNo || "";

    console.log(2, mobileNo);
    if (mobileNo && mobileNo.length === 10) {
      const user = await common.GetRecords(config.userTable, "", { mobileNo });
      console.log(3, user);
      if (user.status) {
        let generateOtp = Math.floor(1000 + Math.random() * 9000);
        const message = `Hey Creator, Your OTP for signIn is ${generateOtp}. Share our app with everyone, not this OTP. Visit adoro.social THINK ELLPSE`;
        const url = `https://sms.prowtext.com/sendsms/sendsms.php?apikey=${config.api_key}&type=TEXT&mobile=${mobileNo}&sender=ELLPSE&PEID=${config.PEID}&TemplateId=${config.templateID}&message=${message}`;

        const sendMsg = await axios.get(url);
        const updateObj = { otp: generateOtp };
        const updatedUser = await common.UpdateRecords(
          config.userTable,
          updateObj,
          mobileNo
        );

        const response = {
          status: 200,
          msg: "OTP Sent Successfully",
        };
        res.send(response);
      } else {
        const response = {
          status: 401,
          msg: "User not found. Please sign up before login.",
        };
        res.send(response);
      }
    } else {
      const response = {
        status: 500,
        msg: "Please provide a valid mobile number",
      };
      res.send(response);
    }
  } catch (error) {
    console.error("Error:", error);
    res.send({ status: 500, msg: "Internal Server Error" });
  }
};

const validateOTP = async (req, res) => {
  try {
    console.log("Lets validate");
    let mobileNo = req.body.mobileNo ? req.body.mobileNo : "";
    let otp = req.body.otp ? req.body.otp : "";
    console.log(1);

    if (mobileNo != "" && mobileNo.length == 10) {
      console.log(2);
      let GetRecords = await common.GetRecords(config.userTable, "", {
        mobileNo,
      });
      console.log(3, GetRecords);
      let token = jwt.sign(
        { id: GetRecords.data[0].Id },
        `'${config.JwtSupersecret}'`,
        {
          expiresIn: 864000,
        }
      );

      if (GetRecords.data[0].otp == otp) {
        let response = {
          status: 200,
          msg: "Successful",
          token: token,
          data: GetRecords.data[0],
        };
        res.send(response);
      } else {
        let response = {
          status: 500,
          msg: "Not Authorized",
        };
        res.send(response);
      }
    }
  } catch (error) {
    res.send(error);
  }
};

async function generateAndSaveOTP(req, res) {
  console.log('HEyyy')
  const mobileNo = req.body.mobileNo || "";
  if (mobileNo !== "" && mobileNo.length === 10) {
    const generateOtp = Math.floor(1000 + Math.random() * 9000);
    const user = await common.GetRecords(config.userTable, "", { mobileNo });
    console.log(user, user.status);
    if (user.status == 200) {
      const response = {
        status: 401,
        msg: "User Already registered.",
      };
      console.log("User already exist")
      return res.send(response);
    }

    const message = `Hey Creator, Your OTP for signUp is ${generateOtp}. Share our app with everyone, not this OTP. Visit adoro.social THINK ELLPSE`;
    const url = `https://sms.prowtext.com/sendsms/sendsms.php?apikey=${config.api_key}&type=TEXT&mobile=${mobileNo}&sender=ELLPSE&PEID=${config.PEID}&TemplateId=${config.templateID}&message=${message}`;
    const sendMsg = await axios.get(url);
  

    if (sendMsg.status !== 200) {
    }
    const newotp = {
      otp: generateOtp,
      mobileNo: mobileNo,
    };

    const userotp = await common.GetRecords("Signup_otp", "", { mobileNo });
    if (userotp.status == 200) {
      const updateObj = { otp: generateOtp };
      try {
        const updatedUser = await common.UpdateRecords(
          "Signup_otp",
          updateObj,
          mobileNo
        );
      } catch (err) {
        return res.send({ status: 500, msg: "Cannot verify" });
      }
    } else {
      try {
        const insertResult = await common.AddRecords("Signup_otp", newotp);
        console.log(insertResult, insertResult.data);
      } catch (err) {
        console.log(err);
        return res.json({ status: 200, msg: "Cannot verify" });
      }
    }

    return res.status(200).json({ status: 200, msg: 'OTP Saved Successfully' });

  } else {
    return res
      .json({ status: 500, msg: "Please provide valid mobile number" });
  }
}

const validatephoneOTP = async (req, res) => {
  try {
    console.log(1);
    const mobileNo = req.body.mobileNo;
    const otp = req.body.otp;
    const fullName = req.body.fullName;
    const userName = req.body.fullName;

    if (mobileNo !== "" && mobileNo.length === 10) {
      console.log(2);
      try{
        const getRecords = await common.GetRecords(
          'Signup_otp',
          "*",
        {mobileNo}
        );
        console.log('REcord in this is ',getRecords,getRecords.status,getRecords.data[0].otp==otp)
        if (
          getRecords.status && getRecords.data[0].otp==otp){

          const signupResult = await usersignup(mobileNo,fullName,userName,otp); // You may need to adjust the arguments based on your usersignup function
console.log(signupResult)
          if (signupResult.status) {
            const token = jwt.sign({ id: signupResult.data.insertId }, config.JwtSupersecret, {
              expiresIn: parseInt(config.JwtTokenExpiresIn),
            });
            const response = {
              status: 200,
              msg: 'Successful',
              token: token,
              data: signupResult,
            };
            res.send(response);
          } else {
            const response = {
              status: 500,
              msg: 'Error in user registration',
            };
            res.send(response);
          }
        }
        else{
          return  res.json({ status: 500, msg: "Invalid Otp" });
        }

      }
catch(err){
  res.json({ status: 500, msg: "Internal Server Error" });

}
    
    } else {
      const response = {
        status: 400,
        msg: "Invalid mobile number",
      };

      res.send(response);
    }
  } catch (error) {
    console.error("Error in validateOTP:", error.message);
    res.send({ status: 500, msg: "Internal Server Error" });
  }
};

async function getCampaign (req,res){
  console.log(1)
  try{
    console.log(2)
    const campaigndetails= await common.GetCampaign('BrandInfo',"","");
    console.log(campaigndetails)
    return res.json({'status':200,'campaigndetails':campaigndetails})
  }
  catch(err){
    return res.status(500).json({'Error':err})
  }

}

module.exports = { login, generateAndSaveOTP, validatephoneOTP, validateOTP, getCampaign };
