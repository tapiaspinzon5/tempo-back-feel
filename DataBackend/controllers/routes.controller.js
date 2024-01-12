require("dotenv").config();
const path = require("path");
const fs = require("fs");
const CryptoJS = require("crypto-js");
const { randomInt } = require("crypto");
const axios = require("axios");
const decompress = require("decompress");
const { v4: uuidv4 } = require("uuid");
const requestIp = require("request-ip");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const sql = require("./sql.controller");
const parametros = require("./params.controller").parametros;
const fetch = require("../helpers/fetch.js");
const { generateToken } = require("../utils/generateToken");
const { checkEmails } = require("../helpers/checkEmailusers");
const { orderAssign } = require("../helpers/orderAgentAssign");
const { bucket } = require("../firebase/firebaseInit");
const logger = require("../utils/logger");
const { sendEmail } = require("../helpers/sendEmail.js");

exports.CallSp = (spName, req, res) => {
  sql
    .query(spName, parametros(req.body, spName))
    .then((result) => {
      responsep(1, req, res, result);
    })
    .catch((err) => {
      logger.error(`${err} - sp`);
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
            process.env.CRYPTOJS_SECRET
          ).toString()
        );
      resolve("Enviado");
    } else if (tipo == 2) {
      logger.error(resultado);
      // res.status(400).json(resultado);
      res
        .status(400)
        .json(
          CryptoJS.AES.encrypt(
            JSON.stringify(resultado),
            process.env.CRYPTOJS_SECRET
          ).toString()
        );
    } else if (tipo == 3) {
      logger.error(resultado);
      res
        .status(401)
        .json(
          CryptoJS.AES.encrypt(
            JSON.stringify(resultado),
            process.env.CRYPTOJS_SECRET
          ).toString()
        );
    }
  });
};

exports.login = async (req, res) => {
  const { graphResponse, mstoken } = req.body;

  // const graphResponse = await fetch(
  //   "https://graph.microsoft.com/beta/me",
  //   mstoken,
  //   res
  // );

  // const data = {
  //   idccms: graphResponse.employeeId,
  //   userName: graphResponse.mailNickname,
  //   name: graphResponse.displayName,
  //   wemail: graphResponse.userPrincipalName,
  //   name: graphResponse.displayName,
  // };

  // const token = jwt.sign(
  //   {
  //     exp: Math.floor(Date.now() / 1000) + 60 * 60,
  //     email: graphResponse.userPrincipalName,
  //   },
  //   process.env.JWT_SECRET
  // );

  const token = generateToken(
    {
      email: graphResponse.userPrincipalName,
    },
    "9h"
  );

  sql
    .query(
      "spQueryRoleUser",
      parametros({ email: graphResponse.userPrincipalName }, "spQueryRoleUser")
    )
    .then((result2) => {
      if (result2.length == 0) {
        return res.status(401).json({ ok: false, msg: "No data in feel" });
      }

      let data = {
        nombre: graphResponse.displayName,
        idccms: graphResponse.employeeId,
        userName: graphResponse.mailNickname,
        email: graphResponse.userPrincipalName,
        token,
        refreshToken: mstoken,
        // nombre: result?.data.data?.nombre,
        // idccms: result?.data.data?.idccms,
        // userName: result?.data.data?.username,
        // token: result?.data.data?.token,
        // refreshToken: result?.data.data?.refreshToken,
        country: result2[0]?.country,
        role: result2[0]?.role,
        numberLogins: result2[0]?.numberLogins,
        idCampaign: result2[0]?.idCampaign,
        nameCampaign: result2[0]?.nameCampaign,
        idLob: result2[0]?.idTeam,
        nameLob: result2[0]?.nameTeam,
        lastLogin: result2[0]?.lastLogin,
        idWave: result2[0]?.idWave,
        wave: result2[0]?.wave,
      };

      // const dataEncrypted = CryptoJS.AES.encrypt(
      //   JSON.stringify(data),
      //   process.env.CRYPTOJS_SECRET
      // ).toString();
      responsep(1, req, res, data);
      // responsep(1, req, res, dataEncrypted);
    })
    .catch((err) => {
      logger.error(`${err} - sp`);
      responsep(2, req, res, err);
    });
};

exports.authLogin = async (req, res) => {
  const { email, password } = req.body;

  sql
    .query(
      "spQueryUsersDB",
      parametros(
        {
          rows: [
            [0, 0, "", "", email, "", "2023-01-01", "", "", 0, 0, 0, "", 1],
          ],
        },
        "spQueryUsersDB"
      )
    )
    .then((result) => {
      if (result.length == 0) {
        return res.status(401).json({ ok: false, msg: "No data in feel" });
      }

      if (bcrypt.compareSync(password, result[0]["passwordEmployee"])) {
        const token = generateToken(
          {
            email,
          },
          "9h"
        );

        sql
          .query("spQueryRoleUser", parametros({ email }, "spQueryRoleUser"))
          .then((result2) => {
            if (result2.length == 0) {
              return res
                .status(401)
                .json({ ok: false, msg: "No data in feel" });
            }

            let data = {
              nombre: result[0]?.NameAgent,
              email,
              token,
              refreshToken: token,
              idccms: 0,
              userName: "",
              country: result2[0]?.country,
              role: result2[0]?.role,
              numberLogins: result2[0]?.numberLogins,
              idCampaign: result2[0]?.idCampaign,
              nameCampaign: result2[0]?.nameCampaign,
              idLob: result2[0]?.idTeam,
              nameLob: result2[0]?.nameTeam,
              lastLogin: result2[0]?.lastLogin,
              idWave: result2[0]?.idWave,
              wave: result2[0]?.wave,
            };

            // res.json(data);
            responsep(1, req, res, data);
            // responsep(1, req, res, dataEncrypted);
          })
          .catch((err) => {
            logger.error(`${err} - sp`);
            responsep(2, req, res, err);
          });
      } else {
        responsep(3, req, res, { ok: false, msg: "Wrong username/password" });
      }
    })
    .catch((err) => {
      logger.error(`${err} - sp`);
      responsep(2, req, res, err);
    });
};

exports.createCampaign = async (req, res) => {
  const { requestedBy, nameCampaign, lobsInfo } = req.body;
  let i = 0;

  try {
    let rows = lobsInfo.map(({ name, idccms, email }) => {
      i = i + 1;
      return [name, idccms, email, i];
    });

    // {
    //   nameCampaign:"nombre de campaña",
    //   lobsInfo:[
    //     {name:"lob1", idccms:"4468546", email:"correopoc@nlsa.teleperformance.com"},
    //     {name:"lob2", idccms:"4462685", email:"correopoc@nlsa.teleperformance.com"},
    //     {name:"lob3", idccms:"4472074", email:"correopoc@nlsa.teleperformance.com"},
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
        logger.error(`${err} - sp`);
        responsep(2, req, res, err);
      });
  } catch (error) {
    logger.error(`${err} - sp`);
    responsep(2, req, res, error);
  }
};

exports.updateCampaign = async (req, res) => {
  const { requestedBy, idCampaign, context, nameCampaign, lobsInfo } = req.body;
  let i = 0;

  try {
    let rows = lobsInfo.map(({ id, name, idEmployee }) => {
      i = i + 1;
      return [nameCampaign, id, name, idEmployee, i];
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
        logger.error(`${err} - sp`);
        responsep(2, req, res, err);
      });
  } catch (error) {
    logger.error(error);
    responsep(2, req, res, error);
  }
};

exports.postCreateCourse = async (req, res) => {
  const {
    requestedBy,
    idCampaign,
    nameCourse,
    descCourse,
    urlImgCourse,
    private,
    idTsat,
    activities,
  } = req.body;
  let i = 0;

  try {
    let rows = activities.map(
      ({
        nameActivity,
        descActivity,
        typeContent,
        urlActivity,
        timeActivity,
      }) => {
        i = i + 1;
        return [
          0,
          nameActivity,
          descActivity,
          typeContent,
          urlActivity,
          i,
          timeActivity,
          i,
        ];
      }
    );

    sql
      .query(
        "spInsertCourse",
        parametros(
          {
            requestedBy,
            idCampaign,
            nameCourse,
            urlImgCourse,
            descCourse,
            private,
            idTsat,
            rows,
          },
          "spInsertCourse"
        )
      )
      .then(async (result) => {
        responsep(1, req, res, result);
      })
      .catch((err) => {
        logger.error(`${err} - sp`);
        responsep(2, req, res, err);
      });
  } catch (error) {
    logger.error(error);
    responsep(2, req, res, error);
  }
};

exports.getcourses = async (req, res) => {
  const { requestedBy, idCampaign, context, idCourse, idLp } = req.body;

  try {
    sql
      .query(
        "spQueryCourses",
        parametros(
          { requestedBy, idCampaign, context, idCourse, idLp },
          "spQueryCourses"
        )
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

        if (result.length === 0) {
          return responsep(1, req, res, rows2);
        }

        // Agrupamos por curso
        result.forEach((e) => {
          // Si el curso ya existe solo agregamos las actividades.
          if (rows[e.idCourse]) {
            rows[e.idCourse].activities.push({
              idActivity: e.idActivity,
              nameActivity: e.nameActivity,
              descActivity: e.descriptionActivity,
              urlActivity: e.url,
              typeContent: e.idActivityType,
              orderActivity: e.OrderActivity,
              progressActivity: e?.progressActivity,
              progressLastActtivity: e?.progressLastActtivity,
              views: e?.views,
              timeActivity: e?.timeActivity,
            });
          }

          // Si el curso no existe, lo insertamos junto con la actividad
          if (!rows[e.idCourse]) {
            rows[e.idCourse] = {
              idCampaign: e.idCampaign,
              nameCampaign: e.nameCampaign,
              idCourse: e.idCourse,
              nameCourse: e.nameCourse,
              descCourse: e.descriptionCourse,
              urlImgCourse: e.urlImgCourse,
              private: e.private,
              StatusCourse: e.StatusCourse,
              UsrCreation: e.UsrCreation,
              idTsat: e.idTsat,
              progressLastCourse: e?.progressLastCourse,
              activities: [
                {
                  idActivity: e.idActivity,
                  nameActivity: e.nameActivity,
                  descActivity: e.descriptionActivity,
                  urlActivity: e.url,
                  typeContent: e.idActivityType,
                  orderActivity: e.OrderActivity,
                  progressActivity: e?.progressActivity,
                  progressLastActtivity: e?.progressLastActtivity,
                  views: e?.views,
                  timeActivity: e?.timeActivity,
                },
              ],
            };
          }
        });

        // removemos los null del array
        rows.forEach((el) => {
          rows2.push(el);
        });

        let coursesWithActivityOrdered = rows2.map((course) => {
          // Ordenamos las actividades por la columna orderActivity
          let sortedActivities = course.activities.sort((r1, r2) =>
            r1.orderActivity > r2.orderActivity
              ? 1
              : r1.orderActivity < r2.orderActivity
              ? -1
              : 0
          );

          course.activities = sortedActivities;
          return course;
        });

        responsep(1, req, res, coursesWithActivityOrdered);
      })
      .catch((err) => {
        logger.error(`${err} - sp`);
        responsep(2, req, res, err);
      });
  } catch (error) {
    logger.error(error);
    responsep(2, req, res, error);
  }
};

exports.updateUsers = async (req, res) => {
  const { requestedBy, context, user } = req.body;
  const roles = ["Agent", "TP Viewer", "Poc", "Super Admin"];

  try {
    // extraemos los valores de un objeto.
    const rows = [[...Object.values(user), 1]];

    if (context == 1 && rows[0][8] == "Viewer") {
      rows[0][12] =
        rows[0][12].length > 15
          ? rows[0][12]
          : bcrypt.hashSync(rows[0][12], saltRounds);
    }

    if (roles.includes(rows[0][8])) {
      rows[0][12] = null;
    }

    // {
    //   "requestedBy": 4472074,
    //   "context": 1,
    //   "user":{"idccms":123456, "idLob": id lob nueva, "idCampaign":id campaña nueva},
    // }

    // Validamos que los datos coincidan con el que estan editando
    let activeUsers = await checkEmails(rows);

    switch (activeUsers.length) {
      case 0:
        break;

      case 1:
        if (activeUsers[0].idEmployee !== user.idEmployee) {
          return res
            .status(409)
            .json(
              CryptoJS.AES.encrypt(
                JSON.stringify(activeUsers),
                process.env.CRYPTOJS_SECRET
              ).toString()
            );
        }
        break;

      default:
        return responsep(2, req, res, activeUsers);
    }

    sql
      .query(
        "spUpdateUser",
        parametros({ requestedBy, context, rows }, "spUpdateUser")
      )
      .then(async (result) => {
        responsep(1, req, res, result);
      })
      .catch((err) => {
        logger.error(`${err} - sp`);
        responsep(2, req, res, err);
      });
  } catch (error) {
    logger.error(error);
    responsep(2, req, res, error);
  }
};

exports.postUpdateCourse = async (req, res) => {
  const {
    requestedBy,
    idCourse,
    idCampaign,
    idActivity,
    nameCourse,
    descCourse,
    urlImgCourse,
    private,
    context,
    activities,
  } = req.body;
  let i = 0;

  try {
    let rows = activities.map(
      ({
        idActivity,
        nameActivity,
        descActivity,
        typeContent,
        urlActivity,
        timeActivity,
      }) => {
        i = i + 1;
        return [
          idActivity.toString().length > 12 ? 0 : idActivity,
          nameActivity,
          descActivity,
          typeContent,
          urlActivity,
          i,
          timeActivity,
          i,
        ];
      }
    );

    sql
      .query(
        "spUpdateCourse",
        parametros(
          {
            requestedBy,
            idCourse,
            idCampaign,
            nameCourse,
            descCourse,
            private,
            urlImgCourse,
            context,
            idActivity,
            rows,
          },
          "spUpdateCourse"
        )
      )
      .then(async (result) => {
        responsep(1, req, res, result);
      })
      .catch((err) => {
        logger.error(`${err} - sp`);
        responsep(2, req, res, err);
      });
  } catch (error) {
    logger.error(error);
    responsep(2, req, res, error);
  }
};

exports.insertUsers = async (req, res) => {
  const { requestedBy, usersInfo } = req.body;
  const roles = ["Agent", "Poc", "Super Admin"];
  let i = 0;

  try {
    let rows = usersInfo.map((el) => {
      i = i + 1;

      if (el[8] == "Viewer") {
        //   el[10] = 1;
        el[12] = bcrypt.hashSync(el[12], saltRounds);
      }

      if (el[8] == "TP Viewer") {
        el[10] = 1;
        el[11] = 1;
        el[12] = null;
      }

      if (roles.includes(el[8])) {
        el[12] = null;
      }

      return [...el, i];
    });

    // Validamos que no existan los correos que ingresaron
    let activeUsers = await checkEmails(rows);
    if (activeUsers.length > 0) {
      activeUsers.forEach((object) => {
        delete object["passwordEmployee"];
      });
      return res
        .status(409)
        .json(
          CryptoJS.AES.encrypt(
            JSON.stringify(activeUsers),
            process.env.CRYPTOJS_SECRET
          ).toString()
        );
    }

    sql
      .query("spInsertUser", parametros({ requestedBy, rows }, "spInsertUser"))
      .then(async (result) => {
        responsep(1, req, res, result);
      })
      .catch((err) => {
        logger.error(`${err} - sp`);
        responsep(2, req, res, err);
      });
  } catch (error) {
    logger.error(error);
    responsep(2, req, res, error);
  }
};

exports.postCreateLP = async (req, res) => {
  const {
    requestedBy,
    nameLP,
    descLP,
    idCampaign,
    idLob,
    idTsat,
    coursesInfo,
  } = req.body;
  let i = 0;

  try {
    let rows = coursesInfo.map((el) => {
      i = i + 1;
      return [...el, i];
    });

    sql
      .query(
        "spInsertLearningPlan",
        parametros(
          { requestedBy, nameLP, descLP, idCampaign, idLob, idTsat, rows },
          "spInsertLearningPlan"
        )
      )
      .then(async (result) => {
        responsep(1, req, res, result);
      })
      .catch((err) => {
        logger.error(`${err} - sp`);
        responsep(2, req, res, err);
      });
  } catch (error) {
    logger.error(error);
    responsep(2, req, res, error);
  }
};

exports.getLearningPlan = async (req, res) => {
  const { requestedBy, idCampaign, idLob } = req.body;

  try {
    sql
      .query(
        "spQueryLearningPlan",
        parametros({ requestedBy, idCampaign, idLob }, "spQueryLearningPlan")
      )
      .then(async (result) => {
        let rows = [];
        let rows2 = [];

        if (result.length === 0) {
          return responsep(1, req, res, rows2);
        }

        // Agrupamos por learningPlan
        result.forEach((e) => {
          // Si ya existe el LP, solo insertamos el Curso
          if (rows[e.idLearningPlan]) {
            rows[e.idLearningPlan].courses.push({
              idCourse: e.idCourse,
              UsrCreationCourse: e.UsrCreationCourse,
              nameCourse: e.nameCourse,
              urlImgCourse: e.urlImgCourse,
              IsPrivate: e.IsPrivate,
              orderCourse: e.OrderCourse,
            });
          }

          // Si no existe el LP, lo insertamos más el curso
          if (!rows[e.idLearningPlan]) {
            rows[e.idLearningPlan] = {
              idLearningPlan: e.idLearningPlan,
              nameLearningPlan: e.nameLearningPlan,
              descriptionLearningPlan: e.descriptionLearningPlan,
              idCampaign: e.idCampaign,
              nameCampaign: e.nameCampaign,
              idLob: e.idLob,
              nameLob: e.nameLob,
              idTsat: e.idTsat,
              courses: [
                {
                  idCourse: e.idCourse,
                  UsrCreationCourse: e.UsrCreationCourse,
                  nameCourse: e.nameCourse,
                  urlImgCourse: e.urlImgCourse,
                  IsPrivate: e.IsPrivate,
                  orderCourse: e.OrderCourse,
                },
              ],
            };
          }
        });

        // removemos los null del array
        rows.forEach((el) => {
          rows2.push(el);
        });

        let learningPlanWcoursesOrdered = rows2.map((lp) => {
          // Ordenamos las actividades por la columna orderActivity
          let sortedCourses = lp.courses.sort((r1, r2) =>
            r1.orderCourse > r2.orderCourse
              ? 1
              : r1.orderCourse < r2.orderCourse
              ? -1
              : 0
          );

          lp.courses = sortedCourses;
          return lp;
        });

        responsep(1, req, res, learningPlanWcoursesOrdered);
      })
      .catch((err) => {
        logger.error(`${err} - sp`);
        responsep(2, req, res, err);
      });
  } catch (error) {
    logger.error(error);
    responsep(2, req, res, error);
  }
};

exports.updateLp = async (req, res) => {
  const { requestedBy, idLP, idLob, nameLP, descLP, context, coursesInfo } =
    req.body;
  let i = 0;

  try {
    let rows = coursesInfo.map((el) => {
      i = i + 1;
      return [...el, i];
    });

    sql
      .query(
        "spUpdateLp",
        parametros(
          {
            requestedBy,
            idLP,
            idLob,
            nameLP,
            descLP,
            context,
            rows,
          },
          "spUpdateLp"
        )
      )
      .then(async (result) => {
        responsep(1, req, res, result);
      })
      .catch((err) => {
        logger.error(`${err} - sp`);
        responsep(2, req, res, err);
      });
  } catch (error) {
    logger.error(error);
    responsep(2, req, res, error);
  }
};

exports.postInsertLPCWave = async (req, res) => {
  const { requestedBy, idWave, assignmentInfo } = req.body;
  let i = 0;

  try {
    let rows = assignmentInfo.map((el) => {
      i = i + 1;
      return [...el, i];
    });

    sql
      .query(
        "spInsertLpWave",
        parametros({ requestedBy, idWave, rows }, "spInsertLpWave")
      )
      .then(async (result) => {
        responsep(1, req, res, result);
      })
      .catch((err) => {
        logger.error(`${err} - sp`);
        responsep(2, req, res, err);
      });
  } catch (error) {
    logger.error(error);
    responsep(2, req, res, error);
  }
};

exports.getWaveAssignments = async (req, res) => {
  const { requestedBy, idWave } = req.body;
  let i = 0;
  let courses = [];
  let learningPlan = [];

  try {
    sql
      .query(
        "spQueryLpWave",
        parametros({ requestedBy, idWave }, "spQueryLpWave")
      )
      .then(async (result) => {
        if (result.length === 0) {
          return responsep(1, req, res, result);
        }

        // Agrupamos dependiendo del tipo de contenido
        result.map((element) => {
          if (element.idlp === null) {
            courses.push(element);
          } else {
            learningPlan.push(element);
          }
        });

        responsep(1, req, res, { courses, learningPlan });
      })
      .catch((err) => {
        logger.error(`${err} - sp`);
        responsep(2, req, res, err);
      });
  } catch (error) {
    logger.error(error);
    responsep(2, req, res, error);
  }
};

exports.getAgentAssignments = async (req, res) => {
  const { requestedBy, context } = req.body;
  const clientIp = "10.168"; //Esta quemada para pruebas
  // const clientIp = requestIp.getClientIp(req);
  const firstPartIp = clientIp.split(".")[0];

  try {
    sql
      .query(
        "spQueryLpAgent",
        parametros({ requestedBy, context }, "spQueryLpAgent")
      )
      .then(async (result) => {
        switch (context) {
          case 1:
            if (result.Result.length === 0) {
              return responsep(1, req, res, { Result: [] });
            }

            if (firstPartIp != 10) {
              const dataFiltered = result.Result.filter(
                (c) => c.IsPrivate !== true
              );

              if (dataFiltered.length === 0) {
                return responsep(1, req, res, { Result: [] });
              }

              const groupedData = orderAssign(dataFiltered);
              responsep(1, req, res, { Result: groupedData });
              // return res.json(groupedData);
            } else {
              const groupedData = orderAssign(result.Result);
              responsep(1, req, res, { Result: groupedData });
              // return res.json(groupedData);
            }
            break;

          case 2:
            if (firstPartIp != 10) {
              const dataFiltered = result.Result.filter(
                (c) => c.IsPrivate !== true
              );

              responsep(1, req, res, { Result: dataFiltered });
            } else {
              responsep(1, req, res, result);
            }
            break;

          case 3:
            responsep(1, req, res, result);
            break;

          default:
            break;
        }
      })
      .catch((err) => {
        logger.error(`${err} - sp`);
        responsep(2, req, res, err);
      });
  } catch (error) {
    logger.error(error);
    responsep(2, req, res, error);
  }
};

exports.postUploadFileFB = async (req, res) => {
  // {
  //   fieldname: 'attachment',
  //   originalname: 'scorm_1676410520956.jpg',
  //   encoding: '7bit',
  //   mimetype: 'image/jpeg',
  //   destination: './uploads/',
  //   filename: '1676471136919-scorm_1676410520956.jpg',
  //   path: 'uploads\\1676471136919-scorm_1676410520956.jpg',
  //   size: 4228
  // }

  const { idActivityType } = req.body;
  let file;
  // console.log(req.files[0].originalname.split(".").reverse()[0]);

  // 1	Video
  // 2	Image
  // 3	Infographic
  // 4	Simulation
  // 5	Arcade
  // 6  imgCourse
  // 7  imgMeeting

  try {
    switch (+idActivityType) {
      case 1:
        await bucket.upload(`${req.file.path}`, {
          destination: `video/${req.file.filename}`,
        });
        delUpFile(req.file.path);
        file = bucket.file(`video/${req.file.filename}`);
        break;

      case 2:
        await bucket.upload(`${req.file.path}`, {
          destination: `image/${req.file.filename}`,
        });
        delUpFile(req.file.path);
        file = bucket.file(`image/${req.file.filename}`);
        break;

      case 3:
        await bucket.upload(`${req.file.path}`, {
          destination: `infographic/${req.file.filename}`,
        });
        delUpFile(req.file.path);
        file = bucket.file(`infographic/${req.file.filename}`);
        break;

      case 4:
        await bucket.upload(`${req.file.path}`, {
          destination: `simulation/${req.file.filename}`,
        });
        delUpFile(req.file.path);
        file = bucket.file(`simulation/${req.file.filename}`);
        break;

      case 5:
        await bucket.upload(`${req.file.path}`, {
          destination: `arcade/${req.file.filename}`,
        });
        delUpFile(req.file.path);
        file = bucket.file(`arcade/${req.file.filename}`);
        break;

      case 6:
        await bucket.upload(`${req.file.path}`, {
          destination: `imgCourse/${req.file.filename}`,
        });
        delUpFile(req.file.path);
        file = bucket.file(`imgCourse/${req.file.filename}`);
        break;

      case 7:
        await bucket.upload(`${req.file.path}`, {
          destination: `imgMeeting/${req.file.filename}`,
        });
        delUpFile(req.file.path);
        file = bucket.file(`imgMeeting/${req.file.filename}`);
        break;

      default:
        break;
    }

    // ------------------------------------------------------

    // Funcion para hacer publico el contenido que se sube a firebase
    file
      .makePublic()
      .then(() => {
        return file.getMetadata();
      })
      .then((results) => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
        return responsep(1, req, res, publicUrl);
      })
      // Utilice el enlace para descargar el archivo en su aplicación Express  })
      .catch((error) => {
        logger.error(error);
        // responsep(2, req, res, error);
      });
  } catch (error) {
    responsep(2, req, res, error);
  }
};

// Funcion para borrar el archivo cargado a FB en local
const delUpFile = async (filePath) => {
  try {
    fs.rm(`./${filePath}`, { recursive: true, force: true }, (error) => {
      if (error) throw new Error(error);
    });
  } catch (error) {
    logger.error(`${error}, delScorm`);
  }
};

exports.downloadScorm = async (req, res) => {
  let { requestedBy, folderName, url } = req.body;
  folderName = folderName == "" ? `${Date.now()}-viewer` : folderName;

  try {
    // Descarga de scorm
    async function get(url, folderName) {
      const options = {
        method: "GET",
        url: url,
        responseType: "arraybuffer",
      };
      const { data } = await axios(options);
      return await createFolder(data, folderName);
    }

    // creacion de la carpeta en caso que no exista
    // Se envuelve en una promesa para poder retornar el resultado
    async function createFolder(fileBuffer, folderName) {
      return new Promise((resolve, reject) => {
        // verifica si la carpeta existe.
        fs.access("./scorms/" + folderName, fs.constants.F_OK, (err) => {
          if (err) {
            // Crea la carpeta.
            fs.mkdir("./scorms/" + folderName, async (err) => {
              if (err) {
                logger.error("Error al crear el directorio:", err);
                reject("Error al crear el directorio", err);
                throw err;
              }
              logger.info("Directorio creado correctamente");
              resolve(await decompressFile(fileBuffer));
              return;
            });
          } else {
            reject("La carpeta existe");
          }
        });
      });
    }

    // Descarga de scorm
    async function decompressFile(compressedFile) {
      return decompress(compressedFile, "./scorms/" + folderName)
        .then(async (files) => {
          logger.info(`Archivo descomprimido en ${"./scorms/" + folderName}`);
          return await fs.promises.readdir("./scorms/" + folderName);
        })
        .catch((err) => {
          logger.error("Error al descomprimir el archivo:", err);
        });
    }

    const file = await get(url, folderName);

    responsep(1, req, res, {
      status: "ok",
      file: file.filter((el) => el.includes(".htm"))[0],
    });
  } catch (error) {
    logger.error(`${error}, "Download failed"`);
    responsep(2, req, res, error);
  }
};

// Eliminacion del scorm en local.
exports.delScorm = async (req, res) => {
  const { folderName } = req.body;

  try {
    if (folderName != "") {
      fs.rm(
        path.join(__dirname, `../scorms/${folderName}`),
        { recursive: true, force: true },
        (error) => {
          if (error) throw new Error(error);
        }
      );
    }
    responsep(1, req, res, { status: "ok" });
  } catch (error) {
    logger.error(`${error}, "delScorm"`);

    responsep(2, req, res, error);
  }
};

exports.generatemcToken = async (req, res) => {
  const { requestedBy } = req.body;

  const token = generateToken(
    {
      email: requestedBy,
    },
    "2m"
  );

  responsep(1, req, res, token);
};

exports.checkmctoken = async (req, res) => {
  return res.status(200).json({ ok: true, message: "valid token" });
};

exports.postUploadANScorm = async (req, res) => {
  // {
  //   fieldname: 'attachment',
  //   originalname: 'scorm_1676410520956.jpg',
  //   encoding: '7bit',
  //   mimetype: 'image/jpeg',
  //   destination: './uploads/',
  //   filename: '1676471136919-scorm_1676410520956.jpg',
  //   path: 'uploads\\1676471136919-scorm_1676410520956.jpg',
  //   size: 4228
  // }

  const { simName, simDesc, requestedBy, context, simId, simUrl } = req.body;

  const folderName = uuidv4();

  async function decompressFile(compressedFile) {
    return decompress(compressedFile, "./scorms/ainesting/" + folderName)
      .then(async (files) => {
        logger.info(
          `Archivo descomprimido en ${"./scorms/ainesting/" + folderName}`
        );
        delUpFile(req.file.path);
        return await fs.promises.readdir(
          `./scorms/ainesting/${folderName}/_files`
        );
      })
      .catch((err) => {
        logger.error("Error al descomprimir el archivo:", err);
      });
  }

  try {
    switch (context) {
      case "1":
        const files = await decompressFile(req.file.path);
        const file = files.filter((el) => el.includes(".htm"))[0];
        const url = `https://${req.hostname}/ainesting/${folderName}/_files/${file}#FS=1`;

        sql
          .query(
            "spSimulation",
            parametros(
              { simName, simDesc, url, requestedBy, simId, context },
              "spSimulation"
            )
          )
          .then(async (result) => {
            responsep(1, req, res, result);
          })
          .catch((err) => {
            logger.error(`${err} - sp`);
            responsep(2, req, res, err);
          });

        break;

      case "2":
        if (req.file) {
          const files = await decompressFile(req.file.path);
          const file = files.filter((el) => el.includes(".htm"))[0];
          const url = `https://${req.hostname}/ainesting/${folderName}/_files/${file}#FS=1`;

          sql
            .query(
              "spSimulation",
              parametros(
                { simName, simDesc, url, requestedBy, simId, context },
                "spSimulation"
              )
            )
            .then(async (result) => {
              delUpFile(`./scorms/ainesting/${simUrl.split("/").reverse()[2]}`);
              responsep(1, req, res, result);
            })
            .catch((err) => {
              logger.error(`${err} - sp`);
              responsep(2, req, res, err);
            });
        } else {
          sql
            .query(
              "spSimulation",
              parametros(
                { simName, simDesc, url: simUrl, requestedBy, simId, context },
                "spSimulation"
              )
            )
            .then(async (result) => {
              responsep(1, req, res, result);
            })
            .catch((err) => {
              logger.error(`${err} - sp`);
              responsep(2, req, res, err);
            });
        }

        break;
      case "3":
        sql
          .query(
            "spSimulation",
            parametros(
              { simName, simDesc, url: simUrl, requestedBy, simId, context },
              "spSimulation"
            )
          )
          .then(async (result) => {
            delUpFile(`./scorms/ainesting/${simUrl.split("/").reverse()[2]}`);
            responsep(1, req, res, result);
          })
          .catch((err) => {
            logger.error(`${err} - sp`);
            responsep(2, req, res, err);
          });

        break;

      default:
        break;
    }
  } catch (error) {
    logger.error(`${error}, "Upload error"`);
    responsep(2, req, res, error);
  }
};

exports.postTrackEvents = async (req, res) => {
  const { requestedBy, simName } = req.body;

  try {
    sql
      .query(
        "spInsertRegistrySimulation",
        parametros({ requestedBy, simName }, "spInsertRegistrySimulation")
      )
      .then(async (result) => {
        res
          .status(200)
          .json(
            CryptoJS.AES.encrypt(
              JSON.stringify(result.Result[0]),
              process.env.CRYPTOJS_AN_SECRET
            ).toString()
          );
      })
      .catch((err) => {
        logger.error(`${err} - sp`);
        responsep(2, req, res, err);
      });
  } catch (error) {
    logger.error(error);
    responsep(2, req, res, error);
  }
};

exports.getCampaignContent = async (req, res) => {
  const { context, idCampaign, idLob, idWave, requestedBy } = req.body;

  try {
    sql
      .query(
        "spQueryContent",
        parametros(
          { context, idCampaign, idLob, idWave, requestedBy },
          "spQueryContent"
        )
      )
      .then(async (result) => {
        switch (context) {
          case 1:
            const groupedData = orderAssign(result);
            // res.json(groupedData);
            responsep(1, req, res, { Result: groupedData });
            break;
          case 2:
            // res.json(result);
            responsep(1, req, res, { Result: result });

            break;
          case 3:
            res.json(result);
            break;
          default:
            break;
        }
      })
      .catch((err) => {
        logger.error(`${err} - sp`);
        responsep(2, req, res, err);
      });
  } catch (error) {
    logger.error(error);
    responsep(2, req, res, error);
  }
};

exports.getTsatQuestions = async (req, res) => {
  const { idTsat } = req.body;

  try {
    sql
      .query("spQueryTsat", parametros({ idTsat }, "spQueryTsat"))
      .then(async (result) => {
        const lang = [];
        const arr1 = [];
        const arr2 = [];

        // result.forEach((el) => {
        //   if (lang.findIndex((lg) => lg.idLTsat === el.idLTsat) === -1) {
        //     lang.push(el);
        //   }
        // });

        result.forEach((el) => {
          switch (el.idLTsat) {
            case 1:
              arr1.push({
                idQTsat: el.idQTsat,
                questionTsat: el.questionTsat,
                idLTsat: el.idLTsat,
              });
              break;

            default:
              arr2.push({
                idQTsat: el.idQTsat,
                questionTsat: el.questionTsat,
                idLTsat: el.idLTsat,
              });
              break;
          }
        });

        let objRes = {
          idTTsat: result[0].idTTsat,
          typeTsat: result[0].typeTsat,
          englishQ: arr1,
          spanishQ: arr2,
        };

        responsep(1, req, res, { Result: objRes });
      })
      .catch((err) => {
        logger.error(`${err} - sp`);
        responsep(2, req, res, err);
      });
  } catch (error) {
    logger.error(error);
    responsep(2, req, res, error);
  }
};

exports.postTsatAnswers = async (req, res) => {
  let i = 0;

  const { requestedBy, idLTsat, idTTsat, idCourse, idLP, answers } = req.body;

  // idQuestion
  // answer
  // idLanguaje
  // idTTsat
  // IdCourse
  // idLP
  // idRegistry

  let rows = answers.map(({ idQTsat, value }) => {
    i = i + 1;
    return [idQTsat, value, idLTsat, idTTsat, idCourse, idLP, i];
  });

  try {
    sql
      .query(
        "spInsertResultsTsat",
        parametros({ requestedBy, rows }, "spInsertResultsTsat")
      )
      .then(async (result) => {
        responsep(1, req, res, result);
      })
      .catch((err) => {
        logger.error(`${err} - sp`);
        responsep(2, req, res, err);
      });
  } catch (error) {
    logger.error(error);
    responsep(2, req, res, error);
  }
};

exports.postInsertBsptRes = async (req, res) => {
  const { requestedBy, resultTest, userName } = req.body;

  const emailInfo = {
    userName,
    resultTest,
  };

  try {
    sql
      .query(
        "spInsertTestBsptResult",
        parametros({ requestedBy, resultTest }, "spInsertTestBsptResult")
      )
      .then(async (result) => {
        await sendEmail(
          emailInfo,
          "BSPT test result",
          "Notification TpFeel",
          "noresponse@teleperformance.com"
        );
        responsep(1, req, res, result);
      })
      .catch((err) => {
        logger.error(`${err} - sp`);
        responsep(2, req, res, err);
      });
  } catch (error) {
    logger.error(error);
    responsep(2, req, res, error);
  }
};
