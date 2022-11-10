const csrf = require("csurf");
const properties = require("../properties/properties");

let exceptionHandler = (req, res, next) => {
  if (properties.ENV == "Production") {
    if (
      req.url === "/api/test" ||
      req.url === "/api/ccmslogin" ||
      req.url === "/login" ||
      req.url === "/container/main"
    ) {
      // Habilitar cuando se vaya a pasar a produccion
      const csrfProtection = csrf({
        cookie: {
          maxAge: 900,
          httpOnly: true,
          sameSite: "strict",
          secure: true,
        },
        ignoreMethods: ["POST", "GET"],
      });
      // Habilita cuando se trabaja en desarrollo
      // const csrfProtection = csrf({ cookie: true, ignoreMethods: ["POST", "GET"] });
      csrfProtection(req, res, next);
    } else {
      // Habilitar cuando se vaya a pasar a produccion
      const csrfProtection = csrf({
        cookie: {
          maxAge: 900,
          httpOnly: true,
          sameSite: "strict",
          secure: true,
        },
      });
      //
      // const csrfProtection = csrf({ cookie: true });
      csrfProtection(req, res, next);
    }
  } else {
    // Habilitar cuando se vaya a pasar a produccion
    const csrfProtection = csrf({
      cookie: { maxAge: 900, httpOnly: true, sameSite: "strict", secure: true },
      ignoreMethods: ["POST", "GET"],
    });
    //
    // const csrfProtection = csrf({ cookie: true, ignoreMethods: ["POST", "GET"] });
    csrfProtection(req, res, next);
  }
};

module.exports = { exceptionHandler };
