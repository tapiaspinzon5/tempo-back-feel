
const jwt = require("jsonwebtoken");
const { decrypt } = require("../controllers/crypt.controller");


exports.checkIdccms = (req, res, next) => {
  const payload = jwt.decode(req.headers.authorization.split(" ")[1]);
  const idccms = JSON.parse(decrypt(payload.data)).data.idccms;

  if (idccms == req.query.idccms) {
    next();
  } else {
    res.status(403).json({
      ok:false,
      msg: "Invalid idccms"
    })
  }
};