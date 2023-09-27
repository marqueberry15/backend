const connectDB = require("../config/db")
const totalcamp = async (req, res) => {
    try {
        console.log("OUUUUUUUUU")
        
        const email = req.params.email;
        console.log("HIII")
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        const query = "SELECT * FROM `BrandInfo` WHERE `email` = ?";
        const [rows] = await connectDB.execute(query, [email]);
        // const query = "SELECT * FROM `BrandInfo` WHERE 1 ";
        // const [rows] = await connectDB.execute(query);
        console.log(rows,email)

        // // Update status and count rows
        // let totalRows = rows.length;
        // let completedRows = 0;
        // let startRows = 0;

        // for (let row of rows) {
        //     if ( row.status == 'completed') {
               
        //         completedRows++;
        //     } else {
               
        //         startRows++;
        //     }
        // }

        return res.status(200).json({
           
            data:rows
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
module.exports=totalcamp