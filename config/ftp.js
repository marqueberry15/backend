const ftp = require('basic-ftp');
const fs=require("fs")
require("dotenv").config()
const config = {
  host: process.env.ftphost, 
  port: process.env.ftpport,
  user: process.env.ftpuser, 
  password: process.env.ftppassword 
};

async function connectFTP(req,res) {
  console.log(req.body,req.file)
  const client = new ftp.Client();

  try {
    await client.access(config);

    // Change directory to 'public_html/marqueberrylogofiles'
    await client.cd('marqueberrylogofiles');

    // Save the buffer as a temporary file
    fs.writeFileSync('tempFile.png', req.file.buffer); // Replace yourBuffer with your actual buffer

    // Upload the temporary file
    await client.uploadFrom('tempFile.png', 'new.png');

    // Delete the temporary file
    fs.unlinkSync('tempFile.png');

    console.log('File uploaded successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    client.close();
  }
}

module.exports= connectFTP;
