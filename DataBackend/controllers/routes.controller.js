require("dotenv").config();
const path = require("path");
const CryptoJS = require("crypto-js");
const { randomInt } = require("crypto");
const sql = require("./sql.controller");
const parametros = require("./params.controller").parametros;

exports.CallSp = (spName, req, res) => {
  sql
    .query(spName, parametros(req.body, spName))
    .then((result) => {
      responsep(1, req, res, result);
    })
    .catch((err) => {
      console.log(err, "sp");
      responsep(2, req, res, err);
    });
};

function isEmpty(req) {
  for (var key in req) {
    if (req.hasOwnProperty(key)) return false;
  }
  return true;
}

exports.test = (req, res) => {
  let num = Math.floor(randomInt(0, 10) * (100 - 1)) + 1;
  let options = {
    //ms s    m     h   d
    maxAge: 1000 * 60 * 60 * 24 * 60, // would expire after 15 minutes
    httpOnly: true,
  };
  res.cookie("XSRF-TOKEN", req.csrfToken(), options);
  res.status(200).json({ random: num });
};

exports.test2 = (req, res) => {
  res.status(200).json({ RST: "Funcional" });
};

let responsep = (tipo, req, res, resultado, cookie) => {
  return new Promise((resolve, reject) => {
    if (tipo == 1) {
      res.cookie("XSRF-TOKEN", req.csrfToken(), {
        expires: new Date(Date.now() + 900000),
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV !== "development",
        sameSite: "Strict",
      });
      // res.status(200).json({ resultado });
      res
        .status(200)
        .json(
          CryptoJS.AES.encrypt(
            JSON.stringify(resultado),
            `secret key 123`
          ).toString()
        );
      resolve("Enviado");
    } else if (tipo == 2) {
      console.log("Error at:", new Date(), "res: ", resultado);
      // res.status(400).json(resultado);
      res
        .status(400)
        .json(
          CryptoJS.AES.encrypt(
            JSON.stringify(resultado),
            `secret key 123`
          ).toString()
        );
    }
  });
};

exports.createCampaign = async (req, res) => {
  const { requestedBy, nameCampaign, lobsInfo } = req.body;
  let i = 0;

  try {
    let rows = lobsInfo.map(({ name, idccms }) => {
      i = i + 1;
      return [name, idccms, i];
    });

    // {
    //   nameCampaign:"nombre de campaña",
    //   lobsInfo:[
    //     {name:"lob1", idccms:"4468546"},
    //     {name:"lob2", idccms:"4462685"},
    //     {name:"lob3", idccms:"4472074"},
    //     ETC...
    //   ]
    // }

    sql
      .query(
        "spInsertCampaign",
        parametros({ requestedBy, nameCampaign, rows }, "spInsertCampaign")
      )
      .then(async (result) => {
        responsep(1, req, res, result);
      })
      .catch((err) => {
        console.log(err, "sp");
        responsep(2, req, res, err);
      });
  } catch (error) {
    console.log(error);
    responsep(2, req, res, error);
  }
};

exports.updateCampaign = async (req, res) => {
  const { requestedBy, idCampaign, context, nameCampaign, lobsInfo } = req.body;
  let i = 0;

  try {
    let rows = lobsInfo.map(({ id, name, idccms }) => {
      i = i + 1;
      return [nameCampaign, id, name, idccms, i];
    });

    // {
    //   "nameCampaign":"nombre de campaña",
    //   "idCampaign":1,
    //   "lobsInfo":[
    //     {"id":1, "name":"lob1", "idccms":"4468546"},
    //     {"id":2,"name":"lob2", "idccms":"4462685"},
    //     {"id":3, "name":"lob3", "idccms":"4472074"},
    //   ]
    // }

    sql
      .query(
        "spUpdateCampaign",
        parametros(
          { requestedBy, idCampaign, context, rows },
          "spUpdateCampaign"
        )
      )
      .then(async (result) => {
        responsep(1, req, res, result);
      })
      .catch((err) => {
        console.log(err, "sp");
        responsep(2, req, res, err);
      });
  } catch (error) {
    console.log(error);
    responsep(2, req, res, error);
  }
};

exports.postCreateCourse = async (req, res) => {
  const {
    requestedBy,
    idCampaign,
    nameCourse,
    descCourse,
    private,
    activities,
  } = req.body;
  let i = 0;

  try {
    let rows = activities.map(
      ({ nameActivity, descActivity, typeContent, urlActivity }) => {
        i = i + 1;
        return [nameActivity, descActivity, typeContent, urlActivity, i];
      }
    );

    sql
      .query(
        "spInsertCourse",
        parametros(
          { requestedBy, idCampaign, nameCourse, descCourse, private, rows },
          "spInsertCourse"
        )
      )
      .then(async (result) => {
        responsep(1, req, res, result);
      })
      .catch((err) => {
        console.log(err, "sp");
        responsep(2, req, res, err);
      });
  } catch (error) {
    console.log(error);
    responsep(2, req, res, error);
  }
};

exports.getcourses = async (req, res) => {
  const { requestedBy, idCampaign } = req.body;

  try {
    sql
      .query(
        "spQueryCourses",
        parametros({ requestedBy, idCampaign }, "spQueryCourses")
      )
      .then(async (result) => {
        let rows = [];
        let rows2 = [];

        // nameActivity
        // descActivity
        // typeContent
        // urlActivity

        // "requestedBy": 4472074,
        // "idCampaign": 1,
        // "nameCourse": "algo",
        // "descCourse": "alguna descripcion",
        // "private": true,
        // "activities":

        // Agrupamos por curso
        result.forEach((e) => {
          if (rows[e.idCourse]) {
            rows[e.idCourse].activities.push({
              idActivity: e.idActivity,
              nameActivity: e.nameActivity,
              descActivity: e.descriptionActivity,
              urlActivity: e.url,
              typeContent: e.idActivityType,
            });
          }

          if (!rows[e.idCourse]) {
            rows[e.idCourse] = {
              idCampaign: e.idCampaign,
              nameCampaign: e.nameCampaign,
              idCourse: e.idCourse,
              nameCourse: e.nameCourse,
              descCourse: e.descriptionCourse,
              private: e.private,
              StatusCourse: e.StatusCourse,
              UsrCreation: e.UsrCreation,
              activities: [
                {
                  idActivity: e.idActivity,
                  nameActivity: e.nameActivity,
                  descActivity: e.descriptionActivity,
                  urlActivity: e.url,
                  typeContent: e.idActivityType,
                },
              ],
            };
          }
        });

        // removemos los null del array
        rows.forEach((el) => {
          rows2.push(el);
        });

        responsep(1, req, res, rows2);
      })
      .catch((err) => {
        console.log(err, "sp");
        responsep(2, req, res, err);
      });
  } catch (error) {
    console.log(error);
    responsep(2, req, res, error);
  }
};

exports.updateUsers = async (req, res) => {
  const { requestedBy, context, user } = req.body;
  const { idccms, idLob, idCampaign } = user;
  try {
    const rows = [[idccms, null, idLob, idCampaign, 1]];
    // {
    //   "requestedBy": 4472074,
    //   "context": 1,
    //   "user":{"idccms":123456, "idLob": id lob nueva, "idCampaign":id campaña nueva},
    // }

    sql
      .query(
        "spUpdateUser",
        parametros({ requestedBy, context, rows }, "spUpdateUser")
      )
      .then(async (result) => {
        responsep(1, req, res, result);
      })
      .catch((err) => {
        console.log(err, "sp");
        responsep(2, req, res, err);
      });
  } catch (error) {
    console.log(error);
    responsep(2, req, res, error);
  }
};

exports.postUpdateCourse = async (req, res) => {
  const { requestedBy, idCourse, context, activities } = req.body;
  let i = 0;

  try {
    let rows = activities.map(
      ({ nameActivity, descActivity, typeContent, urlActivity }) => {
        i = i + 1;
        return [nameActivity, descActivity, typeContent, urlActivity, i];
      }
    );

    sql
      .query(
        "spUpdateCourse",
        parametros({ requestedBy, idCourse, context, rows }, "spUpdateCourse")
      )
      .then(async (result) => {
        responsep(1, req, res, result);
      })
      .catch((err) => {
        console.log(err, "sp");
        responsep(2, req, res, err);
      });
  } catch (error) {
    console.log(error);
    responsep(2, req, res, error);
  }
};

// exports.prueba = (req, res) => {
//   res.status(200).json({ body: req.body });
// };
