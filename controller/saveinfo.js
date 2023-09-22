const connectDB = require("../config/db");
const ftp = require('basic-ftp');
const fs=require("fs")
require("dotenv").config()
const config = {
  host: process.env.ftphost, 
  port: process.env.ftpport,
  user: process.env.ftpuser, 
  password: process.env.ftppassword 
};
// const AWS = require("aws-sdk");
// const s3 = new AWS.S3({
//   signatureVersion: "v4",
//   region: "ap-south-1",
//   accessKeyId: "AKIA4EZQCBCZEEXKXEK3",
//   secretAccessKey: "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",

// function generateRandomString(length) {
//   return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
// }

// Function to generate a unique identifier for the brand
function generateBrandIdentifier(brandName) {
  const timestamp = Date.now();
  // const randomString = generateRandomString(4); // Adjust the length of the random string as needed
  return `${brandName}_${timestamp}`;
}

async function connectFTP(buffer,fileName) {
  
  const client = new ftp.Client();

  try {
    await client.access(config);
    

    // Change directory to 'public_html/marqueberrylogofiles'
    await client.cd('marqueberrylogofiles');

    // Save the buffer as a temporary file
    fs.writeFileSync('tempFile.png', buffer); // Replace yourBuffer with your actual buffer

    // Upload the temporary file
    await client.uploadFrom('tempFile.png', fileName);

    // Delete the temporary file
    fs.unlinkSync('tempFile.png');
    client.close()
    return 1
  } catch (err) {
    client.close()
    return 0;
  } 
}

const saveinfo = async (req, res) => {
  console.log("sfdgdfg",req.body)
 

  try {
    const brandIdentifier = generateBrandIdentifier(req.body.brand_name);

    // Modify the file name to include the brand identifier
    const fileName = `logo_${brandIdentifier}.png`;

    if (!connectFTP(req.file.buffer,fileName)){
      res.send("message:Error i uploading logo")
    }
   
    console.log("logo is successfully uploaded")
    // Insert the image data into the MySQL table
    const insertQuery =
      "INSERT INTO `BrandInfo` (`first_name`, `last_name`, `email`, `company_name`, `mobileNo`, `IsLogo`, `IsStock_image`, `brand_guidlines`, `brand_name`, `campaign_industry`, `campaign_name`, `gif`, `marketing_budget`, `static_meme`, `time_limit`, `video_meme`,`Logo`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)";
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
      fileName
     
    ]);
    console.log("data is saved successfully")

    res.send({ message: "Image saved successfully", status: 200 });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ message: "Internal server error", status: 500 });
  }
};




// const uploadToS3 = async (bucket, key, buffer) => {
//     const s3 = new aws.S3({
//       accessKeyId: process.env.accesskey,
//       secretAccessKey: process.env.secretkey,
//       region: "ap-south-1",
//     });
//     const uploadparams = {
//       Bucket: bucket,
//       Key: key,
//       Body: buffer,
//     };
//     return s3.upload(uploadparams).promise();
//   };

//   const bucket = process.env.bucket;
//     const key = `Order_PF_${Date.now()}.xlsx`;

//     // Upload to S3 using the utility function
//   await uploadToS3(bucket, key, xlsxBuffer);

 async function upload(req, res) {

  const message = req.body
  console.log("DSGFSDGDF",message)

    try {

      const params = {
        Bucket: "marqueberrybackendimage",
        Key: message.file,
        ContentType: message.fileType,
        Expires: 300000,
      };
      console.log(1)
      await s3.putObject()
      const preSignedUrl = await s3.getSignedUrlPromise("putObject", params);
      console.log(2)
      console.log(preSignedUrl);
      return res.send({
        statusCode: 200,
        url:preSignedUrl

      });
    } catch (error) {
      return res.send({
        statusCode: 500,
        body: JSON.stringify({
          error: error.message,
        }),
      });
    }
  }

const AWS = require("aws-sdk");


AWS.config.update({
  accessKeyId: "AKIA4EZQCBCZEEXKXEK3",
  secretAccessKey: "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",
  region: "ap-south-1",
});

const s3 = new AWS.S3();

// const upload = async (req, res) => {
//   const bucketName = "marqueberrybackendimage";
//   const fileName = req.body.file; // Name you want for the file in the bucket
//   const filePath = "public/uploads/" + req.body.file; // Path to the local image file
//   const fileType = req.body.fileType; // Mime type of the file

//   uploadImageToS3(bucketName, fileName, filePath, fileType)
//     .then((url) => console.log(`Image uploaded successfully. URL: ${url}`))
//     .catch((err) => console.error("hjkh,nj", err));
// };
// function uploadImageToS3(bucketName, fileName, filePath, fileType) {
//   const params = {
//     Bucket: bucketName,
//     Key: fileName,
//     Body: fs.readFileSync(filePath),
//     ContentType: fileType,
//     // ACL: 'public-read', // Set ACL to make the object publicly accessible (optional)
//   };
//   console.log(bucketName, fileName, filePath, fileType);

//   return new Promise((resolve, reject) => {
//     s3.upload(params, (err, data) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(data.Location);
//       }
//     });
//   });
// }

// Usage

module.exports = { saveinfo};
