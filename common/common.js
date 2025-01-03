const config = require("../config/config");
const responseCode = require("../constant/response");
const _ = require("underscore");
const mysql = require("mysql2");
const dbConnection = mysql.createPool({
//  host: "srv1021.hstgr.io",
//   user: "u394360389_App",
//   password: "Marqueberryisthegreat@123",
//   database: "u394360389_Adoro",

  host:  process.env.host,
  user: process.env.user3,
   password: process.env.password,
   database:  process.env.database3,

});

console.log('credentails are , ', process.env.host,
   process.env.user3,
   process.env.password,
    process.env.database3)


    dbConnection.getConnection((err, connection) => {
      if (err) {
        console.error("Database3 connection failed:", err.message);
      } else {
        console.log("Database3 connected successfully!");
        connection.release();
      }
    });

dbConnection.promise();


const connectDB = require("../config/db");

module.exports = {
  GetRecords: async (table, fields, whereConditions) => {
    try {
      return new Promise(async (resolve, reject) => {
        let responseObj = {};

        fields = _.isEmpty(fields) ? "*" : fields;

        whereConditions = _.isEmpty(whereConditions) ? {} : whereConditions;

        let sql = `SELECT ${fields} FROM ${table}`;
      
        const conditionKeys = Object.keys(whereConditions);
        if (conditionKeys.length > 0) {
          const conditions = conditionKeys.map((key) => `${key} = ?`);
          sql += " WHERE " + conditions.join(" AND ");
        }

        console.log('query issssssssss',sql)

        try {
          dbConnection.query(

            sql,
            Object.values(whereConditions),
            async (err, result) => {
              if (err) {
                console.log(err);
                reject(responseCode.dbErrorResponse(err));
              }
              if (result && result.length > 0) {
                responseObj = responseCode.fetchRecordSuccessResponse(result);
                resolve(responseObj);
              } else {
                responseObj = responseCode.recordNotFoundResponse();
                resolve(responseObj);
              }
            }
          );
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      return error;
    }
  },

  AddRecords: async (table, addObject) => {
    try {
      console.log('credentails are , ',table,addObject)
      return new Promise(async (resolve, reject) => {
        let responseObj = {};
        let sql = `INSERT INTO ${table} SET ?`;
        try {
          dbConnection.query(sql, addObject, async (err, result) => {
            if (err) {
              console.log(err);
              reject(responseCode.dbErrorResponse(err));
            } else !_.isEmpty(result);
            {
            
              responseObj = await responseCode.recordAddedSuccessResponse(
                result
              );
            }
            
            resolve(responseObj);
          });
        } catch (error) {
          return await error;
        }
      });
    } catch (error) {
      return await error;
    }
  },
  UpdateRecords: async (table, updateObject, mobileNo) => {
    try {
      let responseObj = {};
      const sql = `UPDATE ${table} SET ? WHERE mobileNo = ?`;
      
      const result = await new Promise((resolve, reject) => {
        dbConnection.query(sql, [updateObject, mobileNo], (err, result) => {
          if (err) {
            console.error("Error:", err);
            reject(responseCode.dbErrorResponse(err));
          } else {
            resolve(result);
          }
        });
      });

      if (!_.isEmpty(result)) {
        responseObj = await responseCode.recordUpdatedSuccessResponse();
      }

      return responseObj;
    } catch (error) {
      console.error("Error:", error);
      return await error;
    }
  },

  acceptFollowReq: async (table, updateObject, where) => {
    try {
      return new Promise(async (resolve, reject) => {
        let responseObj = {};
        let sql = `UPDATE ${table} SET ? WHERE ?`;
        try {
          dbConnection.query(
            sql,
            [updateObject, where],
            async (err, result) => {
              if (err) {
                console.log(err);
                reject(responseCode.dbErrorResponse(err));
              } else !_.isEmpty(result);
              {
                // console.log(result)
                responseObj = await responseCode.recordUpdatedSuccessResponse(
                  result
                );
              }
              resolve(responseObj);
            }
          );
        } catch (error) {
          return await error;
        }
      });
    } catch (error) {
      return await error;
    }
  },

  deleteRecords: async (table, where) => {
    try {
      return new Promise(async (resolve, reject) => {
        let responseObj = {};
        let sql = `DELETE FROM ${table} WHERE ${where}`;
        try {
         
          dbConnection.query(sql, async (err, result) => {
            if (err) {
              console.log(err);
              reject(responseCode.dbErrorResponse(err));
            } else !_.isEmpty(result);
            {
             
              responseObj = await responseCode.recordDeleteSuccessResponse(
                result
              );
            }
            resolve(responseObj);
          });
        } catch (error) {
          return await error;
        }
      });
    } catch (error) {
      return await error;
    }
  },
  GetCampaign: async (table, where, fields) => {
    try {
      const details = await connectDB.execute(
        "SELECT * FROM BrandInfo Where `Status`= ? ",
        ["Accepted"]
      );
     
      return details[0];
    } catch (err) {
      return err;
    }
  },
  GetPosts: async (table, fields, categories, userId) => {
    try {
    
      return new Promise(async (resolve, reject) => {
        let responseObj = {};

        fields = _.isEmpty(fields) ? "*" : fields;
        const query = `
  SELECT *
  FROM ${table}
  WHERE category IN ('${categories.join("', '")}')
    AND userName NOT IN (
      SELECT BlockedUserName
      FROM Block
      WHERE UserId = ${userId}
    ) AND Id NOT IN (
      SELECT PostId
      FROM Hide_Post
      WHERE UserId = ${userId}
    )  ORDER By date DESC;
`;
       

       

        try {
          dbConnection.query(query, async (err, result) => {
            if (err) {
              console.log(err);
              reject(responseCode.dbErrorResponse(err));
            }
            if (result && result.length > 0) {
              responseObj = responseCode.fetchRecordSuccessResponse(result);
              resolve(responseObj);
            } else {
              responseObj = responseCode.recordNotFoundResponse();
              resolve(responseObj);
            }
          });
        } catch (error) {
          return await error;
        }
      });
    } catch (error) {
      return await error;
    }
  },

  Logins: async (where) => {
    try {
      return new Promise(async (resolve, reject) => {
        let responseObj = {};
        if (!_.isEmpty(where)) {
          let sql = `SELECT id,username FROM ${config.UserTable} WHERE username = '${where.username}' and password = '${where.password}'`;
          try {
            dbConnection.query(sql, async (err, result) => {
              if (err) {
                reject(err);
              }
              if (!_.isEmpty(result)) {
                let uid = _.isEmpty(result[0] && _.isEmpty(result[0].id))
                  ? result[0].id
                  : "";
                let token = await jwt.sign(
                  { id: uid },
                  `'${config.JwtSupersecret}'`,
                  {
                    expiresIn: 86400, //parseInt(config.JwtTokenExpiresIn)
                  }
                );
                result.push({ token: token });
                responseObj = await responseCode.loginSuccessResponse(result);
              } else {
                responseObj = responseCode.InvalidLoginDetails();
              }
              resolve(responseObj);
            });
          } catch (error) {
            return await error;
          }
        }
      });
    } catch (error) {
      return await error;
    }
  },

  checkToken: async (param) => {
    return new Promise(async (resolve, reject) => {
      jwt.verify(
        param.token,
        `'${config.JwtSupersecret}'`,
        async (err, decoded) => {
          if (err) {
          
            resolve(responseCode.UnauthorizedUser(err));
          }
          if (decoded && decoded.id) {
            resolve(decoded);
          } else {
            resolve(responseCode.UnauthorizedUser(err));
          }
        }
      );
    });
  },

  customQuery: async (sql) => {
  
    try {
      console.log('sql is ',sql)
      return new Promise(async (resolve, reject) => {
        let responseObj = {};

        try {
          dbConnection.query(sql, async (err, result) => {
            if (err) {
              reject(responseCode.dbErrorResponse(err));
            }
            if (result && result.length > 0) {
              responseObj = responseCode.fetchRecordSuccessResponse(result);
              resolve(responseObj);
            } else {
              responseObj = responseCode.recordNotFoundResponse();
              resolve(responseObj);
            }
          });
        } catch (error) {
          return await error;
        }
      });
    } catch (error) {
      return await error;
    }
  },
  sendNotification: async (messageObj) => {
    return new Promise(async (resolve, reject) => {
     
      admin
        .messaging()
        .send(messageObj)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          resolve("");
        });
    });
  },
  addCoinToWallet: async (action, id) => {
    try {
      return new Promise(async (resolve, reject) => {
        let coinValue = 0;
        if (action == "signup") {
          coinValue = 1;
        }
        let responseObj = {};

        try {
          let sql = `SELECT id, balance from wallet where user_id = '${id}'`;

          dbConnection.query(sql, async (err, result) => {
            if (err) {
              throw err;
            } else {
              
              if (result.length > 0) {
                let currentBalance = result[0].balance
                  ? parseInt(result[0].balance)
                  : 0;
                let newBalance = (currentBalance + coinValue).toString();
                let updated_on = moment()
                  .tz("Asia/Kolkata")
                  .format("YYYY-MM-DD HH:mm:ss");
                let sqlforu = `UPDATE wallet
                            SET balance = ${newBalance}, updated_on = '${updated_on}'
                            WHERE id  = ${result[0].id}`;

                dbConnection.query(sqlforu, async (err, result) => {
                  if (err) {
                    throw err;
                  } else {
                    resolve("coin added to wallet");
                  }
                });
              } else {
                // let currentBalance = (result.data[0].balance) ? parseInt(result.data[0].balance) : 0
                let newBalance = coinValue.toString();
                let currentD = moment()
                  .tz("Asia/Kolkata")
                  .format("YYYY-MM-DD HH:mm:ss");
                let sqlforin = `INSERT INTO wallet (user_id, balance, created_at, updated_on)
                        VALUES ('${id}', '${newBalance}', '${currentD}', '${currentD}');
                        `;
                dbConnection.query(sqlforin, async (err, result) => {
                  if (err) {
                    throw err;
                  } else {
                    resolve("coin added to wallet");
                  }
                });
              }
            }
          });
        } catch (error) {
          return await error;
        }
      });
    } catch (error) {
      return await error;
    }
  },
  Update: async (table, updateObject, where) => {
    try {
      let responseObj = {};
      const sql = `UPDATE ${table} SET ? WHERE Id = ?`;

      const result = await new Promise((resolve, reject) => {
        dbConnection.query(sql, [updateObject, where], (err, result) => {
          if (err) {
            reject(responseCode.dbErrorResponse(err));
          } else {
            resolve(result);
          }
        });
      });

      if (!_.isEmpty(result)) {
        responseObj = await responseCode.recordUpdatedSuccessResponse();
      }

      return responseObj;
    } catch (error) {
      console.error("Error:", error);
      return await error;
    }
  },
};
