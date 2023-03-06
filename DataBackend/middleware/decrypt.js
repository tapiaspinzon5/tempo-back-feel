const CryptoJS = require("crypto-js");

function decryptBody(req, res, next) {
  const { data } = req.body;
  const key = process.env.CRYPTOJS_SECRET;

  let hash1 = req.headers.refreshauthorization.split("&#&")[1];
  let hash2 = CryptoJS.SHA512(req.body.data).toString();

  if (hash1 === hash2) {
    req.body = JSON.parse(
      CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8)
    );
    next();
  } else {
    res.status(401).json({ ok: false, msg: "UnauthorizedError" });
  }
}

module.exports = { decryptBody };
