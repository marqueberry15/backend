const connectDB2 = require("../config/db2");
const ftp = require("basic-ftp");
const fs = require("fs").promises;
const getCurrentDateTime = require("./datetime");
const connectDB = require("../config/db");
const stream = require("stream");
const { PassThrough } = require("stream");


const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: process.env.region,
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
});

// Example function to upload a file to S3
async function uploadToS3(buffer, fileName, path) {

  const params = {
    Bucket: "marqueberrry",
    Key: `${path}/${fileName}`,
    Body: buffer,
    // ContentType: 'image/jpeg',
  };

  try {
    await s3.upload(params).promise();
    return 1
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return 0
  }
}


const config = {
  host: process.env.ftphost,
  port: process.env.ftpport,
  user: process.env.ftpuser,
  password: process.env.ftppassword,
};

async function connectFTP(buffer, fileName, path) {
  const client = new ftp.Client();
  const readableStream = new PassThrough();
  readableStream.end(buffer);

  try {
    await client.access(config);
 
    await client.cd(`${path}`);


    await client.uploadFrom(readableStream, fileName);
    
    client.close();
    return 1;
  } catch (err) {
   
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
};

function generateBrandIdentifier(brandName) {
  const timestamp = Date.now();
  return `${brandName}_${timestamp}`;
}


const managerlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const query = "SELECT * FROM `Manager` WHERE `Email` = ?";
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
};

const save = async (req, res) => {
  try {
    const type = req.params.type;
    const { header, content } = req.body;
    const fileName = generateBrandIdentifier(header);

    const path = type === "Blog" ? "marqueberryblog" : "marqueberrycasestudy";
  
   // const result = await connectFTP(req.file.buffer, fileName, path);
    const result = await uploadToS3(req.file.buffer, fileName, path);
    console.log('rrrrrrrrrrrrrrr',result)

    if (result === 0) {
     
      return res.status(500).json({ error: "Error uploading logo" });
    }

    const { date, time } = getCurrentDateTime();


    // const insertQuery = `INSERT INTO ${type} (Header, Content, Image, Date, Time) VALUES (?, ?, ?, ?, ?)`;

    
    // await connectDB2.execute(insertQuery, [
    //   header,
    //   content,
    //   fileName,
    //   date,
    //   time,
    // ]);

 
    res.status(200).json({ msg: "Uploaded Successfully" });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const update = async (req, res) => {
  try {
    const type = req.params.type;
    const {  header, content } = req.body;
    let fileName = req.body.file; 
    if (req.file) {
      fileName = generateBrandIdentifier(header);
      const path = type === "Blog" ? "marqueberryblog" : "marqueberrycasestudy";
      const result = await uploadToS3(req.file.buffer, fileName, path);

      if (result === 0) {
        return res.status(500).json({ error: "Error uploading logo" });
      }
    }

    const { date, time } = getCurrentDateTime();

    const updateQuery = `
      UPDATE ${type}
      SET Header = ?, Content = ?, Image = ?, Date = ?, Time = ?
      WHERE Header = ?
    `;

    await connectDB2.execute(updateQuery, [
      header,
      content,
      fileName || null, // Use new fileName if provided, otherwise keep existing
      date,
      time,
      header,
    ]);

    res.status(200).json({ msg: "Updated Successfully" });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const approval = async (req, res) => {
  const { action } = req.params; 
  const { Id } = req.body; 

  try {
    const updateQuery = "UPDATE `BrandInfo` SET `Status` = ? WHERE `Id` = ?";

    await connectDB.execute(updateQuery, [action, Id]);

    return res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const blog = async (req, res) => {
  try {
    const query = "SELECT * FROM `Blog` WHERE 1";
    const [rows] = await connectDB2.execute(query);

    res.status(200).json({ data: rows });
  } catch (error) {
    console.error("Error fetching data from database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const blogstudy = async (req, res) => {
 
 try{
 
  const { header } = req.params;
  const head = header.replace(/-/g, ' ');

const query = 'SELECT * FROM Blog WHERE Header = ?';
const [rows] = await connectDB2.execute(query, [head]);

  res.status(200).json({ data: rows });
 }
 catch (error) {
  console.error("Error fetching data from database:", error);
  res.status(500).json({ error: "Internal Server Error" });
}
};

const cases = async (req, res) => {
  try {

    const query = "SELECT * FROM `CaseStudy` WHERE 1";
    const [rows] = await connectDB2.execute(query);

    res.status(200).json({ data: rows });
  } catch (error) {
    console.error("Error fetching data from database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const casestudy = async (req, res) => {
  try {
    const { header } = req.params;
    const head = header.replace(/-/g, ' ');
  const query = 'SELECT * FROM CaseStudy WHERE Header = ?';
  const [rows] = await connectDB2.execute(query, [head]);
  res.status(200).json({ data: rows });


  } catch (error) {
    console.error("Error fetching data from database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = { login,managerlogin, save, approval, blog, cases, blogstudy,casestudy, update };


