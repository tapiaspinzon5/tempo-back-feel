const fetch = require("../helpers/fetch");
const logger = require("../utils/logger");

exports.checkMsToken = async (req, res, next) => {
  const { mstoken } = req.body;
  try {
    const graphResponse = await fetch(
      "https://graph.microsoft.com/beta/me",
      mstoken
    );

    req.body.graphResponse = graphResponse;
    next();
  } catch (error) {
    logger.error(error);
    res.status(403).json({
      ok: false,
      msg: "Invalid Microsoft Token",
    });
  }
};
