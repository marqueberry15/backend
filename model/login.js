const connectDB=require("../config/db")
const query=`CREATE TABLE login_history (
    user_email varchar(50) NOT NULL,
    login_time DATETIME NOT NULL,
    PRIMARY KEY (user_id, login_time),
    FOREIGN KEY (user_id) REFERENCES User(Email)
);`

module.export ={query}
