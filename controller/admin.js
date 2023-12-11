const connectDB2 = require("../config/db2")
const ftp = require("basic-ftp");
const fs = require("fs").promises
const getCurrentDateTime=require("./datetime")
require("dotenv").config();
const connectDB =require("../config/db")
const stream = require('stream');
const { PassThrough } = require('stream');



const config = {
  host: process.env.ftphost,
  port: process.env.ftpport,
  user: process.env.ftpuser,
  password: process.env.ftppassword,
};


async function connectFTP(buffer, fileName,path) {
  const client = new ftp.Client();
  console.log(1)
  const readableStream = new PassThrough();
  readableStream.end(buffer);

  try {
    await client.access(config);
    console.log(2)

    await client.cd(`${path}`);
    console.log(3, buffer)

    await client.uploadFrom(readableStream, fileName);
    // console.log('Upload successful:', re);

    client.close();
    return 1;
  } catch (err) {
    console.error('Error:', err); // Log the error for debugging
    client.close();
    return 0;
  }
}




const login = async (req, res) => {
  try {

      const { email, password } = req.body;

      if (!email || !password) {
          return res.status(400).json({ error: "Email and password are required" });
      }

      const query = "SELECT * FROM `Admin` WHERE `Email` = ?";
      const [rows] = await connectDB2.execute(query, [email]);

      if (rows.length === 0) {
          return res.status(401).json({ error: "Invalid email or password" });
      }

      const user = rows[0];

      if (user.Password === password) {
          return res.status(200).json({ msg: "Logged In Successfully" });
      }

      res.status(401).json({ msg: "Password did not match correctly" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
  }
}


function generateBrandIdentifier(brandName) {
  const timestamp = Date.now();
   return `${brandName}_${timestamp}`;
}


const save = async (req, res) => {
  try {
    const type = req.params.type;
    const { header, content } = req.body;
    const fileName = generateBrandIdentifier(header);

    // Define path based on type
    const path = (type === 'Blog') ? 'marqueberryblog' : 'marqueberrycasestudy';
console.log(path)
    // Upload file to FTP
    const result = await connectFTP(req.file.buffer, fileName, path);

    if (result === 0) {
      console.log("error");
      return res.status(500).json({ error: "Error uploading logo" });
    }

    const { date, time } = getCurrentDateTime();

    // Define insert query
    const insertQuery = `INSERT INTO ${type} (Header, Content, Image, Date, Time) VALUES (?, ?, ?, ?, ?)`;

    // Execute the query
    await connectDB2.execute(insertQuery, [header, content, fileName, date, time]);

    // Send success response
    res.status(200).json({ msg: "Uploaded Successfully" });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const approval = async (req, res) => {
 
  const { action } = req.params; // Assuming 'action' is a parameter in your URL
  const { Id } = req.body; // Assuming 'Id' is being sent in the request body

  try {

      const updateQuery = "UPDATE `BrandInfo` SET `Status` = ? WHERE `Id` = ?";
  
      await connectDB.execute(updateQuery, [action, Id]);
     

      return res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
   
      return res.status(500).json({ error: "Internal Server Error" });
  }
}

const blog = async (req, res) => {
  try {
      

    const query = "SELECT * FROM `Blog` WHERE 1";
    const [rows] = await connectDB2.execute(query);


    res.status(200).json({ "data": rows });
  } catch (error) {
    console.error("Error fetching data from database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const casestudy= async (req, res) => {
  try {
     console.log("HELOOO")
    const query = "SELECT * FROM `CaseStudy` WHERE 1";
    const [rows] = await connectDB2.execute(query);


    res.status(200).json({ "data": rows });
  } catch (error) {
    console.error("Error fetching data from database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


module.exports={login,save,approval,blog,casestudy}

// async function generateAndSaveOTP(req, res) {
//   try {
//     const mobileNo = req.body.mobileNo || '';
    

//     if (mobileNo !== '' && mobileNo.length === 10) {
//      const generateOtp = Math.floor(1000 + Math.random() * 9000);
//      const user = await common.GetRecords(config.userTable, "", { mobileNo });
//   console.log(user,user.status)
//   if (user.status==200){
//     const response = {
//       status: 401,
//       msg: 'Phone No. Already registered.',
//     };
//     return res.status(401).send(response);
//   }
  
//     // const generateOtp=1234;
//       // Save OTP to Excel file on Hostinger and upload to FTP
//       const currentDate = new Date();
//       const created_at = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
//       const fileName = `otp_${mobileNo}.txt`;

//      // const saveResult = await saveOTPToHostinger(mobileNo, generateOtp, created_at, fileName);
//      const saveResult = await saveOTPLocally(mobileNo, generateOtp, created_at, fileName);

//       if (saveResult) {
//         return res.status(200).json({ status: 200, msg: 'OTP Saved Successfully' });
//       } else {
//         return res.status(500).json({ status: 500, msg: 'FTP upload failed.' });
//       }
//     } else {
//       return res.status(500).json({ status: 500, msg: 'Please provide valid mobile number' });
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     return res.status(500).json({ status: 500, msg: 'Internal Server Error' });
//   }
// }