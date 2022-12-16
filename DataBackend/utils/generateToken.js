const jwt = require("jsonwebtoken");

exports.generateToken = (payload) => {
  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "9h", //este tiempo lo definió JP
    });

    return token;
  } catch (error) {
    console.log(error);
  }
};
