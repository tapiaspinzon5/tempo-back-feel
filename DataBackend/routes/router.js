const path = require("path");
const multer = require("multer");
const routes = require("../controllers/routes.controller");
const { checkIdccms } = require("../middleware/checkIdccms");
const { checkJwtToken } = require("../middleware/checkJwtToken");
const { checkMsToken } = require("../middleware/checkMsToken");
const { decryptBody } = require("../middleware/decrypt");
const oauth = require("../middleware/oauth");
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        path.basename(
          file.originalname.replaceAll(" ", ""),
          path.extname(file.originalname.replaceAll(" ", ""))
        ) +
        path.extname(file.originalname.trim())
    );
  },
  limits: {
    fileSize: 629145600, // Compliant: 8MB
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 629145600,
  },
});

module.exports = (router) => {
  //Login (obsoleto)
  router.post("/ccmslogin", (req, res) => {
    oauth.login(req, res);
  });

  // Refresh token (obsoleto)
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

  // Insert Users
  router.post("/insertusers", checkJwtToken, decryptBody, routes.insertUsers);
  router.post(
    "/poc/postcreatelp",
    checkJwtToken,
    decryptBody,
    routes.postCreateLP
  );

  router.post(
    "/getlearningplan",
    checkJwtToken,
    decryptBody,
    routes.getLearningPlan
  );

  router.post(
    "/poc/postinsertlpcWave",
    checkJwtToken,
    decryptBody,
    routes.postInsertLPCWave
  );

  router.post("/updatelp", checkJwtToken, decryptBody, routes.updateLp);
  router.post(
    "/poc/getwaveassignments",
    checkJwtToken,
    decryptBody,
    routes.getWaveAssignments
  );
  router.post(
    "/a/getassignments",
    checkJwtToken,
    decryptBody,
    routes.getAgentAssignments
  );
  router.post(
    "/su/postuploadfilefb",
    checkJwtToken,
    upload.single("attachment"),
    routes.postUploadFileFB
  );

  router.post(
    "/a/downloadscorm",
    checkJwtToken,
    decryptBody,
    routes.downloadScorm
  );

  // router.post("/prueba", decryptBody, routes.prueba);

  router.post("/a/delscorm", checkJwtToken, decryptBody, routes.delScorm);
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
  MapSpRouter("/poc/getlobscourses", "spQueryLobCourses");
  MapSpRouter("/poc/postcreatewave", "spInsertWave");
  MapSpRouter("/poc/postupdatewave", "spUpdatewave");
  MapSpRouter("/getwaves", "spQueryWaves");
  MapSpRouter("/poc/postcreatemeeting", "spInsertMeeting");
  MapSpRouter("/poc/postupdatemeeting", "spupdateMeeting");
  MapSpRouter("/poc/getmeetings", "spQueryMeet");
  MapSpRouter("/getanalytics", "spQueryAnalitycs");
  MapSpRouter("/a/posttrackevents", "spInsertEventAgent");

  function MapSpRouter(route, spName) {
    router.post(route, checkJwtToken, decryptBody, (req, res) =>
      routes.CallSp(spName, req, res)
    );
  }
};
