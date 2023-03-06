const { parametros } = require("../controllers/params.controller");
const sql = require("../controllers/sql.controller");
const logger = require("../utils/logger");

exports.checkEmails = (rows) => {
  return sql
    .query("spQueryUsersDB", parametros({ rows }, "spQueryUsersDB"))
    .then(async (result) => {
      let activeUsers = result.filter((el) => {
        return el.statusUser == "Active";
      });
      return activeUsers;
    })
    .catch((err) => {
      logger.error(`${err}, spQueryUsersDB`);
      throw new Error("spQueryUsersDB error: " + err);
    });
};
