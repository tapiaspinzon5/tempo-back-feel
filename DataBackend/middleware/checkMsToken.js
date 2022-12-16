const fetch = require("../helpers/fetch");

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
    console.log(error);
    res.status(403).json({
      ok: false,
      msg: "Invalid Microsoft Token",
    });
  }
};
