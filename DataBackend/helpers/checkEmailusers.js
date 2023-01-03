const { parametros } = require("../controllers/params.controller");
const sql = require("../controllers/sql.controller");

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
      console.log(err, "spQueryUsersDB");
      throw new Error("spQueryUsersDB error: " + err);
    });
};
