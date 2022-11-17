const routes = require("../controllers/routes.controller");
const { checkIdccms } = require("../middleware/checkIdccms");
const { decryptBody } = require("../middleware/decrypt");
const oauth = require("../middleware/oauth");

module.exports = (router) => {
  //Login
  router.post("/ccmslogin", (req, res) => {
    oauth.login(req, res);
  });

  // Refresh token
  router.post("/refreshToken", (req, res) => {
    oauth.refresh(req, res);
  });

  // METODOS PERSONALIZADOS
  // router.get("/auth/login/:app", routes.login);

  // Create campaign
  router.post(
    "/su/createcampaign",
    oauth.oauthOther,
    decryptBody,
    routes.createCampaign
  );

  // update campaign
  router.post(
    "/su/updatecampaign",
    oauth.oauthOther,
    decryptBody,
    routes.updateCampaign
  );

  // Create course
  router.post(
    "/su/postcreatecourse",
    oauth.oauthOther,
    decryptBody,
    routes.postCreateCourse
  );

  // router.post("/prueba", decryptBody, routes.prueba);

  //CRUD
  MapSpRouter("/sqlget", "spGetCentral");
  MapSpRouter("/sqlupdate", "spUpdateCentral");
  MapSpRouter("/sqlinsert", "spInsertCentral");
  MapSpRouter("/sqldelete", "spDeleteCentral");
  MapSpRouter("/sqldelete", "spDeleteCentral");
  MapSpRouter("/sqldelete", "spDeleteCentral");
  MapSpRouter("/getagentesinfomd", "spQueryUsersMD");
  MapSpRouter("/su/getcampaigncontent", "spQueryCampaignContent");

  function MapSpRouter(route, spName) {
    router.post(route, oauth.oauthOther, decryptBody, (req, res) =>
      routes.CallSp(spName, req, res)
    );
  }
};
