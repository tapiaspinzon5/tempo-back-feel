const { expressjwt: jwt2 } = require("express-jwt");
require("dotenv").config();
const config = require("../properties/properties").valor;

exports.jwt = () => {
  const secret = process.env.SECRET;
  return jwt2({ secret, algorithms: ["HS256"] }).unless({
    path: ["/api/ccmslogin", "/api/refreshToken", "/container/main"],
  });
};
