require("dotenv").config();
const path = require("path");
const fs = require("fs");
const CryptoJS = require("crypto-js");
const { randomInt } = require("crypto");
const jwt = require("jsonwebtoken");
const requestIp = require("request-ip");
const AdmZip = require("adm-zip");
const axios = require("axios");

const sql = require("./sql.controller");
const parametros = require("./params.controller").parametros;
const fetch = require("../helpers/fetch.js");
const { generateToken } = require("../utils/generateToken");
const { checkEmails } = require("../helpers/checkEmailusers");
const { orderAssign } = require("../helpers/orderAgentAssign");
const { bucket } = require("../firebase/firebaseInit");

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
  //   wemail: graphResponse.onPremisesUserPrincipalName,
  //   name: graphResponse.displayName,
  // };

  // const token = jwt.sign(
  //   {
  //     exp: Math.floor(Date.now() / 1000) + 60 * 60,
  //     email: graphResponse.onPremisesUserPrincipalName,
  //   },
  //   process.env.JWT_SECRET
  // );

  const token = generateToken({
    email: graphResponse.onPremisesUserPrincipalName,
  });

  sql
    .query(
      "spQueryRoleUser",
      parametros(
        { email: graphResponse.onPremisesUserPrincipalName },
        "spQueryRoleUser"
      )
    )
    .then((result2) => {
      if (result2.length == 0) {
        return res.status(401).json({ ok: false, msg: "No data in feel" });
      }

      let data = {
        nombre: graphResponse.displayName,
        idccms: graphResponse.employeeId,
        userName: graphResponse.mailNickname,
        email: graphResponse.onPremisesUserPrincipalName,
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
      console.log(err, "sp");
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
    urlImgCourse,
    private,
    activities,
  } = req.body;
  let i = 0;

  try {
    let rows = activities.map(
      ({ nameActivity, descActivity, typeContent, urlActivity }) => {
        i = i + 1;
        return [nameActivity, descActivity, typeContent, urlActivity, i, i];
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
            rows,
          },
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
  const { requestedBy, idCampaign, context, idCourse } = req.body;

  try {
    sql
      .query(
        "spQueryCourses",
        parametros(
          { requestedBy, idCampaign, context, idCourse },
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
              activities: [
                {
                  idActivity: e.idActivity,
                  nameActivity: e.nameActivity,
                  descActivity: e.descriptionActivity,
                  urlActivity: e.url,
                  typeContent: e.idActivityType,
                  orderActivity: e.OrderActivity,
                  progressActivity: e?.progressActivity,
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

  try {
    // extraemos los valores de un objeto.
    const rows = [[...Object.values(user), 1]];

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
          return responsep(2, req, res, activeUsers);
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
        console.log(err, "sp");
        responsep(2, req, res, err);
      });
  } catch (error) {
    console.log(error, "error");
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
      ({ nameActivity, descActivity, typeContent, urlActivity }) => {
        i = i + 1;
        return [nameActivity, descActivity, typeContent, urlActivity, i, i];
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
        console.log(err, "sp");
        responsep(2, req, res, err);
      });
  } catch (error) {
    console.log(error);
    responsep(2, req, res, error);
  }
};

exports.insertUsers = async (req, res) => {
  const { requestedBy, usersInfo } = req.body;
  let i = 0;

  try {
    let rows = usersInfo.map((el) => {
      i = i + 1;
      return [...el, i];
    });

    // Validamos que no existan los correos que ingresaron
    let activeUsers = await checkEmails(rows);
    if (activeUsers.length > 0) return responsep(2, req, res, activeUsers);

    sql
      .query("spInsertUser", parametros({ requestedBy, rows }, "spInsertUser"))
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

exports.postCreateLP = async (req, res) => {
  const { requestedBy, nameLP, descLP, idCampaign, idLob, coursesInfo } =
    req.body;
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
          { requestedBy, nameLP, descLP, idCampaign, idLob, rows },
          "spInsertLearningPlan"
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
        console.log(err, "sp");
        responsep(2, req, res, err);
      });
  } catch (error) {
    console.log(error);
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
        console.log(err, "sp");
        responsep(2, req, res, err);
      });
  } catch (error) {
    console.log(error);
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
        console.log(err, "sp");
        responsep(2, req, res, err);
      });
  } catch (error) {
    console.log(error);
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
        console.log(result);
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
        console.log(err, "sp");
        responsep(2, req, res, err);
      });
  } catch (error) {
    console.log(error);
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
                (c) => c.isPrivate !== true
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
                (c) => c.isPrivate !== true
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
        console.log(err, "sp");
        responsep(2, req, res, err);
      });
  } catch (error) {
    console.log(error);
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
        console.error(error);
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
    console.log(error, "delScorm");
  }
};

exports.downloadScorm = async (req, res) => {
  const { requestedBy, folderName, url } = req.body;
  const MAX_FILES = 10000;
  const MAX_SIZE = 1000000000; // 1 GB
  const THRESHOLD_RATIO = 10;
  let fileCount = 0;
  let totalSize = 0;

  try {
    // Descarga de scorm
    async function get(url) {
      const options = {
        method: "GET",
        url: url,
        responseType: "arraybuffer",
      };
      const { data } = await axios(options);
      return data;
    }

    // Extraccion del contenido en local
    async function getAndUnZip(url) {
      const zipFileBuffer = await get(url);
      const zip = new AdmZip(zipFileBuffer);

      // Me retorna todos los elementos que contiene el zip
      let zipEntries = zip.getEntries();

      // Recorremos c/u de los elementos para validarlos
      zipEntries.forEach(function (zipEntry) {
        fileCount++;
        if (fileCount > MAX_FILES) {
          throw "Reached max. number of files";
        }

        let entrySize = zipEntry.getData().length;
        totalSize += entrySize;
        if (totalSize > MAX_SIZE) {
          throw "Reached max. size";
        }

        // let compressionRatio = entrySize / zipEntry.header.compressedSize;
        // if (compressionRatio > THRESHOLD_RATIO) {
        //   throw "Reached max. compression ratio";
        // }

        // if (!zipEntry.isDirectory) {
        //   zip.extractEntryTo(zipEntry.entryName, "./scorms/" + folderName);
        // }
        zip.extractAllTo("./scorms/" + folderName, true);
      });
    }
    await getAndUnZip(url);
    const file = await fs.promises.readdir("./scorms/" + folderName);

    res.json({
      status: "ok",
      file: file.filter((el) => el.includes(".htm"))[0],
    });

    // responsep(1, req, res, {
    //   status: "ok",
    //   file: file.filter((el) => el.includes(".htm"))[0],
    // });
  } catch (error) {
    console.log(error, "Download failed");
    responsep(2, req, res, error);
  }
};

// Eliminacion del scorm en local.
exports.delScorm = async (req, res) => {
  const { folderName } = req.body;

  try {
    fs.rm(
      path.join(__dirname, `../scorms/${folderName}`),
      { recursive: true, force: true },
      (error) => {
        if (error) throw new Error(error);
      }
    );

    responsep(1, req, res, { status: "ok" });
  } catch (error) {
    console.log(error, "delScorm");
    responsep(2, req, res, error);
  }
};
