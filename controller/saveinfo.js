const connectDB = require("../config/db");
const ftp = require("basic-ftp");
const fs = require("fs");
require("dotenv").config();
const getCurrentDateTime= require("./datetime")
const config = {
  host: process.env.ftphost,
  port: process.env.ftpport,
  user: process.env.ftpuser,
  password: process.env.ftppassword,
};

function generateBrandIdentifier(brandName) {
  const timestamp = Date.now();
  // const randomString = generateRandomString(4); // Adjust the length of the random string as needed
  return `${brandName}_${timestamp}`;
}

async function connectFTP(buffer, fileName) {
  const client = new ftp.Client();

  try {
    await client.access(config);

    // Change directory to 'public_html/marqueberrylogofiles'
    await client.cd("marqueberrylogofiles");

    // Save the buffer as a temporary file
    fs.writeFileSync("tempFile.png", buffer); // Replace yourBuffer with your actual buffer

    // Upload the temporary file
    await client.uploadFrom("tempFile.png", fileName);

    // Delete the temporary file
    fs.unlinkSync("tempFile.png");
    client.close();
    return 1;
  } catch (err) {
    client.close();
    return 0;
  }
}

const saveinfo = async (req, res) => {

  try {
    const brandIdentifier = generateBrandIdentifier(req.body.brand_name);

    // Modify the file name to include the brand identifier
    const fileName = `logo_${brandIdentifier}.png`;

    if (!connectFTP(req.file.buffer, fileName)) {
      res.send("message:Error i uploading logo");
    }
    const status = req.body.Status ? req.body.Status : "pending";
    const {date,time}=getCurrentDateTime()
        
     
    const insertQuery =
      "INSERT INTO `BrandInfo` (`first_name`, `last_name`, `email`, `company_name`, `mobileNo`, `IsLogo`, `IsStock_image`, `brand_guidlines`, `brand_name`, `campaign_industry`, `campaign_name`, `gif`, `marketing_budget`, `static_meme`, `time_limit`, `video_meme`,`Logo`,`Status`,`date`,`time`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?)";
    await connectDB.query(insertQuery, [
      req.body.first_name,
      req.body.last_name,
      req.body.email,
      req.body.company_name,
      req.body.mobileNo,
      req.body.IsLogo,
      req.body.IsStock_image,
      req.body.brand_guidlines,
      req.body.brand_name,
      req.body.campaign_industry,
      req.body.campaign_name,
      req.body.gif,
      req.body.marketing_budget,
      req.body.static_meme,
      req.body.time_limit,
      req.body.video_meme,
      fileName,
      status,
      date,
      time
    ]);
    

    res.send({ message: "Image saved successfully", status: 200 });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ message: "Internal server error", status: 500 });
  }
};

module.exports = { saveinfo };
