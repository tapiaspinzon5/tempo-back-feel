const redirect = require("../controllers/redirect.controller");
const logger = require("../utils/logger");
require("dotenv").config();

async function configure(call) {
  let idKey = Buffer.from(process.env.IDKEY, "base64").toString();

  let body = {
    key: idKey,
    project: process.env.PROJECT,
    ip: "",
    uri: "/api/configserver",
    size: 0,
  };
  await redirect
    .post("https://oauth.teleperformance.co", "/api/configserver", body, null)
    .then((data) => {
      process.env.SECRET = data.data.secret;
      process.env.ALGORITHM = data.data.algo;
      process.env.KEY = data.data.key;
      process.env.IV = data.data.iv;
      call("terminado");
    })
    .catch((error) => logger.error(error));
}

module.exports = { configure };
