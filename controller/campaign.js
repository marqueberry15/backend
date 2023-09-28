const connectDB = require("../config/db");
const totalcamp = async (req, res) => {
  try {
    const email = req.params.email;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const query = "SELECT * FROM `BrandInfo` WHERE `email` = ?";
    const [rows] = await connectDB.execute(query, [email]);

    return res.status(200).json({
      data: rows,
    });
  } catch (err) {

    return res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = totalcamp;
