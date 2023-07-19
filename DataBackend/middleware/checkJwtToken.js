const jwt = require("jsonwebtoken");

exports.checkJwtToken = (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization;
    const token = bearerToken.split(" ")[1];
    // const decodedCookie = decryptData(refreshTokenCookie);

    if (token == "null") {
      throw new Error("token not found");
    }

    jwt.verify(token, process.env.JWT_SECRET);

    next();
  } catch (error) {
    return res.status(401).json({ ok: false, message: error.message, no: 1 });
  }
};

exports.checkANJwtToken = (req, res, next) => {
  try {
    const token = req.headers["access-token"];

    if (token == "null") {
      throw new Error("Token not found");
    }

    jwt.verify(token, process.env.JWT_AN_SECRET);

    next();
  } catch (error) {
    return res.status(401).json({ ok: false, message: error.message, no: 1 });
  }
};
