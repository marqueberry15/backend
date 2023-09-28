const nodemailer = require("nodemailer");
require("dotenv").config();

const contact = async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
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

    res.send({ status: 200, msg: "Successfull" });
  } catch (error) {
   
    res.status(500).send("Internal Server Error");
  }
};

module.exports = contact;
