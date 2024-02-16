const config = require("../config/config");
const responseCode = require("../constant/response");
const _ = require("underscore");
const mysql = require("mysql2");
const dbConnection = mysql.createPool({
  host: "srv1021.hstgr.io",
  user: "u394360389_App",
  password: "Marqueberryisthegreat@123",
  database: "u394360389_Adoro",
});

dbConnection.promise();
const connectDB = require("../config/db");

module.exports = {
  GetRecords: async (table, fields, where) => {
    try {
      return new Promise(async (resolve, reject) => {
        let responseObj = {};

        fields = _.isEmpty(fields) ? "*" : fields;

        where = _.isEmpty(where) ? 1 : where;

        let sql = `SELECT ${fields} FROM ${table} WHERE ?`;
      

        try {
          dbConnection.query(sql, [where], async (err, result) => {
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

  AddRecords: async (table, addObject) => {
    try {
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
              // console.log(result)
              responseObj = await responseCode.recordAddedSuccessResponse(
                result
              );
            }
            // console.log(responseObj)
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
      console.log(sql, mobileNo);

      const result = await new Promise((resolve, reject) => {
        dbConnection.query(sql, [updateObject, mobileNo], (err, result) => {
          if (err) {
            console.error("Error:", err);
            reject(responseCode.dbErrorResponse(err));
          } else {
            console.log("Result:", result);
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
          console.log(sql);
          dbConnection.query(sql, async (err, result) => {
            if (err) {
              console.log(err);
              reject(responseCode.dbErrorResponse(err));
            } else !_.isEmpty(result);
            {
              console.log(result);
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
      console.log(3);

      const details = await connectDB.execute(
        "SELECT * FROM BrandInfo Where `Status`= ? ",
        ["Accepted"]
      );
      console.log(4);
      console.log("details", details[0]);
      return details[0];
    } catch (err) {
      return err;
    }
  },
  GetPosts: async (table, fields, categories) => {
    try {
      console.log(table, fields, categories);
      return new Promise(async (resolve, reject) => {
        let responseObj = {};

        fields = _.isEmpty(fields) ? "*" : fields;
        const query = `SELECT * FROM ${table} WHERE category IN ('${categories.join(
          "', '"
        )}');`;

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
            console.log("=========", err);
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

    console.log('query is ',sql)
    try {
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
      console.log(messageObj);
      admin
        .messaging()
        .send(messageObj)
        .then((response) => {
          console.log("Notification sent successfully:", response);
          resolve(response);
        })
        .catch((error) => {
          console.error("Error sending notification:", error);
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
              console.log(result);
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
                console.log(sqlforin);
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
};
