const ftp = require("basic-ftp");
const { PassThrough } = require('stream')
const getCurrentDateTime=require('./datetime')
const common = require("../common/common");
const config = require("../config/config");
const configr = {
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
      await client.access(configr);
      console.log(2)
  
      await client.cd("UserProfilePic");
      console.log(3, buffer)
  
      await client.uploadFrom(readableStream, fileName,{ overwrite: true });
      
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
        const {date,time}=getCurrentDateTime()
        const fileName=`${date}_${time}`
        const result= await connectFTP(req.file.buffer,fileName)
        if (result){
          const updatedUser = await common.UpdateRecords(
            config.userTable,
           {ProfileDp:fileName},
            req.body.mobileNo
          ); 
          if(updatedUser){
            return res.send({status:200,msg:"Picture Uploaded Succesfully",file:fileName})

          }
          else   return res.send({status:401,msg:"Error in Picture Uploading"})

        }
        else{
            return res.send({status:500,msg:"Facing Problem in Uploading Picture"})
        }


    }
    catch(err){

        return res.status(501).send({msg:err})
    }
}

exports.userDetail= async(req,res)=>{
  console.log('USERRRRRRRRRRRRRR', req.query); // Change req.body to req.query
  const mobileNo = req.query.mobileNo;
  const User=await common.GetRecords(config.userTable,'',{mobileNo})
  console.log(User)
  if (User.status){
    return res.status(200).send({status:200,msg:"Getting Details Successfully",data:User.data[0]})
  }
  else{
    return res.send({status:500,msg:"Error in Getting Details "})
  }


}