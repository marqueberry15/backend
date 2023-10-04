const connectDB = require("../config/db");

const SELECT_ALL_QUERY = "SELECT * FROM `BrandInfo` WHERE ?";
const SELECT_BY_EMAIL_QUERY = "SELECT * FROM `BrandInfo` WHERE `email` = ?";

const totalcamp = async (req, res) => {
  try {
    const email = req.params.email;

    if (!email) {
      const [rows] = await connectDB.execute(SELECT_ALL_QUERY, [1]); // Assuming 1 is a valid condition
      return res.status(200).json({ data: rows });
    }

    const [rows] = await connectDB.execute(SELECT_BY_EMAIL_QUERY, [email]);

    res.status(200).json({ data: rows }); // Moved the response out of the if-else block
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = totalcamp;
