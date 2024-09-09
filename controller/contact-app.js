const nodemailer = require("nodemailer");
require("dotenv").config();


const contactapp = async (req, res) => {

    console.log('htttt')
    console.log('Email:', process.env.email);
console.log('Password:', process.env.password2);

    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
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
        text: `Name: ${req.body.full_name}\nEmail: ${req.body.address}\nMessage: ${req.body.message}\nMobile: ${req.body.mobileNo}`,
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('fffffff',info)
  
      res.send({ status: 200, msg: "Successfull" });
    } catch (error) {
     
      res.status(500).send("Internal Server Error");
    }
  };

  module.exports = contactapp;