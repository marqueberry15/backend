const nodemailer = require("nodemailer");
require("dotenv").config();

const contact = async (req, res) => {
  try {
    console.log(req.body);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.email,
        pass: process.env.password2,
      },
    });

    const mailOptions = {
      from: process.env.email,
      to: "sushma.rani@marqueberry.com", 
      subject: "Form Submission",
      text: `Name: ${req.body.full_name}\nEmail: ${req.body.email}\nMessage: ${req.body.message}\nMobile: ${req.body.mobileNo}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    res.send("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = contact;
