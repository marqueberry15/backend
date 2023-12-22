const ftp = require("basic-ftp");
const { PassThrough } = require('stream')
const config = {
    host: '154.41.233.75',
    port: process.env.ftpport,
    user: 'u394360389.Admin',
    password: process.env.ftppassword,
  };
async function connectFTP(buffer, fileName) {
    const client = new ftp.Client();
    console.log(1)
    const readableStream = new PassThrough();
    console.log('aaaaaaa')
  readableStream.end(buffer);
  console.log("bbbbbbb",config)
  
    try {
      await client.access(config);
      console.log(2)
  
      await client.cd("UserProfilePic");
      console.log(3, buffer)
  
      await client.uploadFrom(readableStream, fileName);
      
      client.close();
      return 1;
    } catch (err) {
      console.error('Error:', err); 
      client.close();
      return 0;
    }
  }
exports.updateprofile= async(req,res)=>{
    console.log('REEEEEEEEEEEEE',req.file.buffer,req.body)

    try{
        console.log("hey")
        const result= await connectFTP(req.file.buffer,req.body.mobileNo)
        if (result){
            return res.send({status:200,msg:"Picture Uploaded Succesfully"})
        }
        else{
            return res.send({status:500,msg:"Facing Problem in Uploading Picture"})
        }


    }
    catch(err){

        return res.status(501).send({msg:err})
    }
}