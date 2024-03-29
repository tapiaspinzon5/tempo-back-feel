console.clear();

require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const hpp = require("hpp");
const properties = require("./properties/properties");
const csrf = require("csurf");
// const csrfProtection = csrf({cookie: true});
const port = properties.PORT;
const app = express();
const requestIp = require("request-ip");
const helmet = require("helmet");
const router = express.Router();
const routes = require("./routes/router");
const {
  loggerMiddleware,
  middleware,
  errorHandler,
} = require("./controllers/err.handler");
const { exceptionHandler } = require("./controllers/csrf.handler");
const { jwt } = require("./controllers/jwt.controller");
const { configure } = require("./controllers/configure");
const path = require("path");
const AdmZip = require("adm-zip");
const { default: axios } = require("axios");
const logger = require("./utils/logger");
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://feelsdev.teleperformance.co",
    "https://tpfeeltest.teleperformance.co",
    "https://feeldev.teleperformance.co",
    "https://feel.teleperformance.co",
    "https://gamificationtest.teleperformance.co",
    "http://localhost:4200",
    "https://nesting-test.teleperformance.co:4201",
    "https://nestingclient.teleperformance.co",
  ],
  credentials: true,
  methods: "GET,POST, OPTIONS",
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.set({
    "Cache-Control": `no-cache, no-store, must-revalidate`,
  });
  next();
});
// app.use(helmet.frameguard({ action: "SAMEORIGIN" }));
// app.use(helmet.noSniff());
app.use(helmet.hidePoweredBy());
// app.use(helmet.permittedCrossDomainPolicies());
// app.use(csrfProtection);
app.disable("x-powered-by");

app.use(express.json({ limit: "10mb", type: "application/json" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestIp.mw());
app.use(hpp());
// configure((call) => {
//   app.use(jwt());
// });
app.use(loggerMiddleware);
app.use(express.static(path.join(__dirname, "/dist")));
app.use(express.static(path.join(__dirname, "/scorms")));

app.use(middleware);
app.use(morgan("dev"));
app.use(cookieParser());
app.use(exceptionHandler);
app.use(errorHandler);
app.use("/api", router);

routes(router);

// De acuerdo a la ruta que tenga la peticion. servimos el contenido de los scorms.
// De acuerdo a la ruta que tenga la peticion. servimos el contenido de los scorms.
// app.get("*", async (req, res) => {
//   if (req._parsedOriginalUrl.pathname == "/scorm") {
//     const { folderName, context } = req.query;

//     if (context == 1) {
//       app.use(express.static(path.join(__dirname, `/scorms/${folderName}`)));

//       res.sendFile(
//         path.join(__dirname, "./scorms/" + folderName + "/index.html"),
//         {
//           headers: { dirName: folderName },
//         }
//       );
//     } else {
//       app.use(express.static(path.join(__dirname, `/scorms/${folderName}`)));
//       const { file } = req.query;

//       res.sendFile(
//         path.join(__dirname, "./scorms/" + folderName + "/" + file),
//         {
//           headers: { dirName: folderName },
//         }
//       );
//     }
//   } else {
//     res.sendFile(path.join(__dirname, "dist/index.html"));
//   }
// });

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

app.listen(port, function () {
  logger.info(`${properties.ENV}: Listening on port ${port}`);
});
