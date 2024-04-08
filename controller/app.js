const common = require("../common/common");
const config = require("../config/config");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

const moment = require("moment-timezone");
const fakeNumbers = [
  "8740012043",
  "8740001234",
  "9461422121",
  "1234321459",
  "6745341278",
  "7400705595",
  "5400705595",
  "2400705595",
  "3400705595",
  "4400705595",
  "7976500383",
  "7976500382",
  "7976500381",
  "7976500380",
  "7976500384",
  "7809984932",
  "9809984932",
  "7608907392",
  "8608097392",
  "6808907392",
  "8826608505",
  "9826608505",
  "7826608505",
  "6826608505",
  "5826608505",
  "9990698793",
  "9990698792",
  "9990698790",
  "9990698791",
  "9990698794",
  "9811319861",
  "1811319861",
  "2811319861",
  "3811319861",
  "4811319861",
];

// const usersignup = async (mobileNo, fullName, userName, otp, referal) => {
//   try {
//     const currentDate = new Date();
//     const user = await common.GetRecords(config.userTable, "", { mobileNo });
//     const username = await common.GetRecords(config.userTable, "", {
//       userName,
//     });
//     if (user.status) {
//       const response = {
//         status: 401,
//         msg: "Phone No. Already registered.",
//       };
//       res.send(response);
//     }

//     const timestamp = currentDate.getTime();
//     const created_at = moment()
//       .tz("Asia/Kolkata")
//       .format("YYYY-MM-DD HH:mm:ss");

//     const newUser = {
//       fullName: fullName,
//       userName: userName,
//       refer_id: `${userName}_${timestamp}`,
//       created_on: created_at,
//       mobileNo: mobileNo,
//       otp: otp,
//     };

//     const insertResult = await common.AddRecords(config.userTable, newUser);

//     if (insertResult.status) {
//       const referaluser = await common.GetRecords(config.userTable, "", {
//         referal,
//       });

//       const referal_list = referaluser.Referal;
//       if (!referal_list) {
//         referal_list = referal;
//       } else if (referal_list && referal_list.trim() === "") {
//         referal_list = referal;
//       } else {
//         referal_list += ` ${referal}`;
//       }

//       console.log(referal_list);

//       const addreferallist = await common.updateObj(config.userTable, "", {
//         Referal: referal_list,
//       });

//       if (addreferallist.status) {
//         console.log("added referal column succesfully");
//         return insertResult;
//       }
//     } else {
//       return null;
//     }
//   } catch (error) {
//     console.error("Error in usersignup:", error.message);
//     return null;
//   }
// };

const usersignup = async (mobileNo, fullName, userName, otp) => {
  try {
    const currentDate = new Date();
    const user = await common.GetRecords(config.userTable, "", { mobileNo });
    const username = await common.GetRecords(config.userTable, "", {
      userName,
    });

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

    const newUser = {
      fullName: fullName,
      userName: userName,
      refer_id: `${userName}_${timestamp}`,
      created_on: created_at,
      mobileNo: mobileNo,
      otp: otp,
    };

    const insertResult = await common.AddRecords(config.userTable, newUser);

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
  console.log("loggining in");
  try {
    const mobileNo = req.body.mobileNo || "";

    if (mobileNo && mobileNo.length === 10) {
      const user = await common.GetRecords(config.userTable, "", { mobileNo });

      if (user.status) {
        let generateOtp;

        if (fakeNumbers.includes(mobileNo)) {
          generateOtp = 1111;
        } else {
          generateOtp = Math.floor(1000 + Math.random() * 9000);

          const message = `Hey Creator, Your OTP for signIn is ${generateOtp}. Share our app with everyone, not this OTP. Visit adoro.social THINK ELLPSE`;
          const url = `https://sms.prowtext.com/sendsms/sendsms.php?apikey=${config.api_key}&type=TEXT&mobile=${mobileNo}&sender=ELLPSE&PEID=${config.PEID}&TemplateId=${config.templateID}&message=${message}`;

          const sendMsg = await axios.get(url);
        }

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
    let mobileNo = req.body.mobileNo ? req.body.mobileNo : "";
    let otp = req.body.otp ? req.body.otp : "";

    if (mobileNo != "" && mobileNo.length == 10) {
      let GetRecords = await common.GetRecords(config.userTable, "", {
        mobileNo,
      });

      let token = jwt.sign(
        { id: GetRecords.data[0].Id },
        `'${config.JwtSupersecret}'`,
        {
          expiresIn: 86400,
        }
      );

      if (GetRecords.data[0].otp == otp) {
        let response = {
          status: 200,
          msg: "Successful",
          token: token,
          data: GetRecords.data[0],
        };
        res.status(200).send(response);
      } else {
        let response = {
          status: 500,
          msg: "Not Authorized",
        };
        res.status(500).send(response);
      }
    }
  } catch (error) {
    res.send(error);
  }
};

async function generateAndSaveOTP(req, res) {
  console.log("otptt isss  getting otp for signup");
  try {
    const mobileNo = req.body.mobileNo || "";

    if (mobileNo !== "" && mobileNo.length === 10) {
      let generateOtp;

      if (fakeNumbers.includes(mobileNo)) {
        generateOtp = 1111;
      } else {
        generateOtp = Math.floor(1000 + Math.random() * 9000);
        console.log("generated otp is ", generateOtp);

        const message = `Hey Creator, Your OTP for signUp is ${generateOtp}. Share our app with everyone, not this OTP. Visit adoro.social THINK ELLPSE`;
        const url = `https://sms.prowtext.com/sendsms/sendsms.php?apikey=${config.api_key}&type=TEXT&mobile=${mobileNo}&sender=ELLPSE&PEID=${config.PEID}&TemplateId=${config.templateID}&message=${message}`;
        const sendMsg = await axios.get(url);
        console.log("send msg isss", sendMsg);

        if (sendMsg.status !== 200) {
          // Handle error if OTP sending fails
        }
      }

      const user = await common.GetRecords(config.userTable, "", { mobileNo });
      const username = await common.GetRecords(config.userTable, "", {
        userName: req.body.userName,
      });

      if (username.status == 200) {
        const response = {
          status: 401,
          msg: "Username must be unique",
        };
        return res.send(response);
      }

      if (user.status == 200) {
        const response = {
          status: 401,
          msg: "User Already registered. Please SignIn",
        };
        return res.send(response);
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
        } catch (err) {
          return res.json({ status: 200, msg: "Cannot verify" });
        }
      }

      return res
        .status(200)
        .json({ status: 200, msg: "OTP Saved Successfully" });
    } else {
      return res.json({
        status: 500,
        msg: "Please provide valid mobile number",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.send({ status: 500, msg: "Internal Server Error" });
  }
}

const validatephoneOTP = async (req, res) => {
  try {
    const mobileNo = req.body.mobileNo;
    const otp = req.body.otp;
    const fullName = req.body.fullName;
    const userName = req.body.fullName;

    if (mobileNo !== "" && mobileNo.length === 10) {
      try {
        const getRecords = await common.GetRecords("Signup_otp", "*", {
          mobileNo,
        });

        if (getRecords.status && getRecords.data[0].otp == otp) {
          const signupResult = await usersignup(
            mobileNo,
            fullName,
            userName,
            otp,
          ); // You may need to adjust the arguments based on your usersignup function

          if (signupResult.status) {
            const token = jwt.sign(
              { id: signupResult.data.insertId },
              config.JwtSupersecret,
              {
                expiresIn: 86400,
              }
            );
            const response = {
              status: 200,
              msg: "Successful",
              token: token,
              data: { mobileNo, fullName, userName, otp },
            };
            res.send(response);
          } else {
            const response = {
              status: 500,
              msg: "Error in user registration",
            };
            res.send(response);
          }
        } else {
          return res.json({ status: 500, msg: "Invalid Otp" });
        }
      } catch (err) {
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

async function getCampaign(req, res) {
  try {
    const campaigndetails = await common.GetCampaign("BrandInfo", "", "");
    return res.json({ status: 200, campaigndetails: campaigndetails });
  } catch (err) {
    return res.status(500).json({ Error: err });
  }
}

const update = async (req, res) => {
  try {
    const fullName = req.body.fullName;
    const userName = req.body.userName;
    const Email = req.body.Email;
    const accountNo = req.body.accountNo;
    const bankName = req.body.bankName;
    const benificiaryName = req.body.benificiaryName;
    const ifscCode = req.body.ifscCode;
    const mobileNo = req.body.mobileNo;
    const gender = req.body.gender;

    const updateResult = await common.UpdateRecords(
      config.userTable,
      {
        fullName,
        userName,
        Email,
        accountNo,
        bankName,
        benificiaryName,
        ifscCode,
        mobileNo,
        gender,
      },
      mobileNo
    );

    if (updateResult.status) {
      res.status(200).json({ msg: "Update successful", data: updateResult });
    } else {
      res.json({ status: 500, msg: updateResult.Error.sqlMessage });
    }
  } catch (error) {
    console.error("Error updating records:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const saveInterest = async (req, res) => {
  try {
    const { mobileNo, selectedInterests } = req.body;
    const Interest = selectedInterests.map((item) => item).join(" ");

    const updateResult = await common.UpdateRecords(
      config.userTable,
      { Interest },
      mobileNo
    );

    if (updateResult.status) {
      return res
        .status(200)
        .json({ msg: "DONEEE", updateResult: updateResult.data });
    } else {
      console.error("Update failed:", updateResult.error);
      return res
        .status(500)
        .json({ error: "Internal Server Error", updateResult: null });
    }
  } catch (error) {
    console.error("Error saving interest:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", updateResult: null });
  }
};

const contact = async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.email,
        pass: process.env.password2,
      },
    });

    const mailOptions = {
      from: process.env.email,
      to: "info@marqueberry.com",
      subject: "Form Submission",
      text: `Name: ${req.body.full_name}\nEmail: ${req.body.email}\nMessage: ${req.body.message}\nMobile: ${req.body.mobileNo}`,
    };

    const info = await transporter.sendMail(mailOptions);

    res.send({ status: 200, msg: "Successful" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  login,
  generateAndSaveOTP,
  validatephoneOTP,
  validateOTP,
  getCampaign,
  update,
  saveInterest,
  contact,
};
