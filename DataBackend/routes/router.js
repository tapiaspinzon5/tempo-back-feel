const routes = require("../controllers/routes.controller");
const { checkIdccms } = require("../middleware/checkIdccms");
const { checkJwtToken } = require("../middleware/checkJwtToken");
const { checkMsToken } = require("../middleware/checkMsToken");
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
  router.post("/login", checkMsToken, routes.login);
  // router.get("/auth/login/:app", routes.login);

  // Create campaign
  router.post(
    "/su/createcampaign",
    checkJwtToken,
    decryptBody,
    routes.createCampaign
  );

  // update campaign
  router.post(
    "/su/updatecampaign",
    checkJwtToken,
    decryptBody,
    routes.updateCampaign
  );

  // Create course
  router.post(
    "/su/postcreatecourse",
    checkJwtToken,
    decryptBody,
    routes.postCreateCourse
  );
  // Create course
  router.post("/su/getcourses", checkJwtToken, decryptBody, routes.getcourses);
  // edit users
  router.post("/updateuser", checkJwtToken, decryptBody, routes.updateUsers);

  // Update course
  router.post(
    "/su/updateCourse",
    checkJwtToken,
    decryptBody,
    routes.postUpdateCourse
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
  MapSpRouter("/su/getusers", "spQueryUser");

  function MapSpRouter(route, spName) {
    router.post(route, checkJwtToken, decryptBody, (req, res) =>
      routes.CallSp(spName, req, res)
    );
  }
};
