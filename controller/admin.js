const connectDB2 = require("../config/db2")
const ftp=require("basic-ftp")
const fs=require("fs");

require("dotenv").config();
const connectDB =require("../config/db")

const config = {
  host: process.env.ftphost,
  port: process.env.ftpport,
  user: process.env.ftpuser,
  password: process.env.ftppassword,
};

async function connectFTP(buffer, fileName) {
  const client = new ftp.Client();

  try {
    await client.access(config);

   
    await client.cd("marqueberryimage");

    fs.writeFileSync("tempFile.png", buffer); 
    await client.uploadFrom("tempFile.png", fileName);


    fs.unlinkSync("tempFile.png");
    client.close();
    return 1;
  } catch (err) {
    client.close();
    return 0;
  }
}
const login = async (req, res) => {
  console.log(req.body)
  try {

      const { email, password } = req.body;
console.log(email,password)
      if (!email || !password) {
          return res.status(400).json({ error: "Email and password are required" });
      }

      const query = "SELECT * FROM `Admin` WHERE `Email` = ?";
      const [rows] = await connectDB2.execute(query, [email]);
console.log(rows)
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
  // const randomString = generateRandomString(4); // Adjust the length of the random string as needed
  return `${brandName}_${timestamp}`;
}

const save = async (req, res) => {
  const type = req.params.type;
  const { header, content, } = req.body;
  const fileName=generateBrandIdentifier(header)

  if (!connectFTP(req.file.buffer, fileName)) {
    res.send("message:Error i uploading logo");
  }



  try {
    const insertQuery = `INSERT INTO ${type} (Header, Content,Image) VALUES (?, ?,?)`;
     await connectDB2.execute(insertQuery, [header, content,fileName]).then(()=>res.status(200).json({msg:"Uploaded Successfully"}))
   .catch((err)=>res.status(500).json({error:err}))
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
      console.error("Error updating status:", error);
      return res.status(500).json({ error: "Internal Server Error" });
  }
}

const blog = async (req, res) => {
  try {
    console.log("HEYYYYYYY");
    
    const query = "SELECT * FROM `Blog` WHERE 1";
    const [rows] = await connectDB2.execute(query);

    res.status(200).json({ "data": rows });
  } catch (error) {
    console.error("Error fetching data from database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


module.exports={login,save,approval,blog}