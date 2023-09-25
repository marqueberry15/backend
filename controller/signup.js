const connectDB = require("../config/db");
const bcrypt = require("bcrypt");

const getCurrentDateTime = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  const formattedTime = `${hours}:${minutes}:${seconds}`;

  return { date: formattedDate, time: formattedTime };
};
const register = async (req, res) => {
  try {
    const { first_name, last_name, mobileNo, email, password, company_name } =
      req.body;
    console.log("destruction", first_name, mobileNo);

    if (
      !first_name ||
      !last_name ||
      !mobileNo ||
      !email ||
      !password ||
      !company_name
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query =
      "INSERT INTO `User` (`Firstname`, `Lastname`, `Email`, `Phone`, `Password`, `Comapnyname`) VALUES (?, ?, ?, ?, ?, ?)";
    const params = [
      first_name,
      last_name,
      email,
      mobileNo,
      hashedPassword,
      company_name,
    ];
    console.log(params, process.env.password);
    await connectDB.execute(query, params);

    return res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const { date, time } = getCurrentDateTime();

    const query = "SELECT * FROM `User` WHERE `Email` = ?";
    const [rows] = await connectDB.execute(query, [email]);


    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.Password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const query2 =
      "INSERT INTO `Login` (`UserId`, `Time`, `Date`) VALUES (?, ?, ?) ;";
    const param2 = [email, time, date];

    await connectDB
      .execute(query2, param2)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
      console.log("responding")

    return res
      .status(200)
      .json({ message: "Login successful", user: user});
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
const hello=(req,res)=>{

  console.log("Sushma")
  res.send({message:"Hello"})
}

module.exports = {
  register,
  login,
  hello
};
