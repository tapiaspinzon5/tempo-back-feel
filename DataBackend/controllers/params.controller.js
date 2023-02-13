const TYPES = require("tedious").TYPES;

let parametrizacion = (data) => {
  try {
    return data.map(({ name, value, type, schema }) => ({
      nombre: name,
      valor: value,
      tipo: type,
    }));
  } catch (error) {
    console.error(error);
    return error;
  }
};

class SpParam {
  name;
  value;
  type;
  schema;

  constructor(name, value, type, schema = null) {
    this.name = name;
    this.value = value;
    this.type = type;
    this.schema = schema;
  }
}

let SpParamTable = (nameParam, colums, rows) => {
  try {
    let table;
    let obj = {
      table: [],
    };
    table = {
      columns: colums,
      rows: rows,
    };
    obj.table.push({
      nombre: nameParam,
      valor: table,
      tipo: TYPES.TVP,
    });

    return obj.table;
  } catch (error) {
    console.log(error, "Tipo Tabla");
    return error;
  }
};

// Esta funcion se armó con la finalidad de poder enviar parametros individuales y tablas en conjunto a un SP
let SpParamTable2 = (nameParam, colums, rows) => {
  try {
    let table;
    // let obj = {
    //   table: []
    // }
    table = {
      columns: colums,
      rows: rows,
    };
    return {
      name: nameParam,
      value: table,
      type: TYPES.TVP,
      schema: null,
    };
    //  obj.table;
  } catch (error) {
    console.log(error, "Tipo Tabla");
    return error;
  }
};

let insertCampaignTable = [
  {
    name: "nameLob",
    type: TYPES.VarChar,
  },
  {
    name: "identPoc",
    type: TYPES.Int,
  },
  {
    name: "emailPoc",
    type: TYPES.VarChar,
  },
  {
    name: "idRegistry",
    type: TYPES.Int,
  },
];

let updateCampaignTable = [
  {
    name: "nameCampaign",
    type: TYPES.VarChar,
  },
  {
    name: "IdLob",
    type: TYPES.Int,
  },
  {
    name: "nameLob",
    type: TYPES.VarChar,
  },
  {
    name: "identPoc",
    type: TYPES.Int,
  },
  {
    name: "idRegistry",
    type: TYPES.Int,
  },
];

let insertSuperCourseTable = [
  {
    name: "nameActivity",
    type: TYPES.VarChar,
  },
  {
    name: "descActivity",
    type: TYPES.VarChar,
  },
  {
    name: "typeCLP",
    type: TYPES.Int,
  },
  {
    name: "urlActivity",
    type: TYPES.VarChar,
  },
  {
    name: "orderActivity",
    type: TYPES.Int,
  },
  {
    name: "idRegistry",
    type: TYPES.Int,
  },
];
let insertLearningPlanTable = [
  {
    name: "nameActivity",
    type: TYPES.VarChar,
  },
  {
    name: "descActivity",
    type: TYPES.VarChar,
  },
  {
    name: "typeCLP",
    type: TYPES.Int,
  },
  {
    name: "urlActivity",
    type: TYPES.VarChar,
  },
  {
    name: "idRegistry",
    type: TYPES.Int,
  },
];

let updateUserTable = [
  {
    name: "ident",
    type: TYPES.Int,
  },
  {
    name: "roleUser",
    type: TYPES.VarChar,
  },
  {
    name: "idLob",
    type: TYPES.Int,
  },
  {
    name: "idCampaign",
    type: TYPES.Int,
  },
  {
    name: "idRegistry",
    type: TYPES.Int,
  },
];

let insertLPTable = [
  {
    name: "ident",
    type: TYPES.Int,
  },
  {
    name: "roleUser",
    type: TYPES.VarChar,
  },
  {
    name: "idLob",
    type: TYPES.Int,
  },
  {
    name: "idCampaign",
    type: TYPES.Int,
  },
  {
    name: "idRegistry",
    type: TYPES.Int,
  },
];

let insertUpdateUserTable = [
  {
    name: "ident",
    type: TYPES.Int,
  },
  {
    name: "idEmployee",
    type: TYPES.Int,
  },
  {
    name: "firstname",
    type: TYPES.VarChar,
  },
  {
    name: "lastname",
    type: TYPES.VarChar,
  },
  {
    name: "email",
    type: TYPES.VarChar,
  },
  {
    name: "position",
    type: TYPES.VarChar,
  },
  {
    name: "hiredate",
    type: TYPES.Date,
  },
  {
    name: "country",
    type: TYPES.VarChar,
  },
  {
    name: "roleUser",
    type: TYPES.VarChar,
  },
  {
    name: "idwave",
    type: TYPES.Int,
  },
  {
    name: "idLob",
    type: TYPES.Int,
  },
  {
    name: "idCampaign",
    type: TYPES.Int,
  },
  {
    name: "idRegistry",
    type: TYPES.Int,
  },
];

let insertCoursesTable = [
  {
    name: "idCourse",
    type: TYPES.Int,
  },
  {
    name: "orderCourse",
    type: TYPES.Int,
  },
  {
    name: "idRegistry",
    type: TYPES.Int,
  },
];

let insertLPCWavesTable = [
  {
    name: "idlp",
    type: TYPES.Int,
  },
  {
    name: "idCourse",
    type: TYPES.Int,
  },
  {
    name: "idRegistry",
    type: TYPES.Int,
  },
];

exports.parametros = (req, tipo) => {
  switch (tipo) {
    case "spUpdateRoleUser":
      return parametrizacion([
        new SpParam("UsrChange", req.idccms, TYPES.Int),
        new SpParam("ident", req.idccmsUser, TYPES.Int),
        new SpParam("role", req.role, TYPES.VarChar),
        new SpParam("idTeam", req.idTeam, TYPES.Int),
        new SpParam("Context", req.context, TYPES.Int),
        SpParamTable2("table", tableInsertRol, req.rows),
        SpParamTable2("tableAgent", reportLeadTable, req.rows2),
      ]);

    case "spQueryGeneralJourney":
      return parametrizacion([
        new SpParam("ident", req.idccms, TYPES.Int),
        new SpParam("context", req.context, TYPES.Int),
        new SpParam("idcampaign", req.idcampaign, TYPES.Int),
      ]);

    case "spInsertCampaign":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("nameCampaign", req.nameCampaign, TYPES.VarChar),
        SpParamTable2("table", insertCampaignTable, req.rows),
      ]);
    case "spUpdateCampaign":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("idCampaign", req.idCampaign, TYPES.Int),
        new SpParam("context", req.context, TYPES.Int),
        SpParamTable2("table", updateCampaignTable, req.rows),
        // SpParamTable2("LoadUsers ", insertUpdateUserTable, req.rows2),
      ]);
    case "spQueryCampaignContent":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("context", req.context, TYPES.Int),
        new SpParam("idcampaign", req.idCampaign, TYPES.Int),
        new SpParam("idlob", req.idLob, TYPES.Int),
        new SpParam("idLearningPlan", req.idLearningPlan, TYPES.Int),
      ]);
    case "spQueryUsersMD":
      return parametrizacion([
        new SpParam("user", req.user, TYPES.VarChar),
        // new SpParam("Context", req.context, TYPES.Int),
      ]);
    case "spQueryRoleUser":
      return parametrizacion([new SpParam("user", req.email, TYPES.VarChar)]);

    case "spInsertCourse":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("idCampaign", req.idCampaign, TYPES.Int),
        new SpParam("nameCourse", req.nameCourse, TYPES.VarChar),
        new SpParam("urlImgCourse", req.urlImgCourse, TYPES.VarChar),
        new SpParam("descripctionCourse", req.descCourse, TYPES.VarChar),
        new SpParam("isPrivate", req.private, TYPES.Bit),
        SpParamTable2("table", insertSuperCourseTable, req.rows),
      ]);
    case "spQueryCourses":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("idCampaign", req.idCampaign, TYPES.Int),
        new SpParam("context", req.context, TYPES.Int),
        new SpParam("idCourse", req.idCourse, TYPES.Int),
      ]);
    case "spQueryUser":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("IdMin", req.start, TYPES.Int),
        new SpParam("IdMax", req.end, TYPES.Int),
      ]);
    case "spUpdateUser":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("Context", req.context, TYPES.Int),
        SpParamTable2("table", insertUpdateUserTable, req.rows),
      ]);
    case "spUpdateCourse":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("idCourse", req.idCourse, TYPES.Int),
        new SpParam("idCampaign", req.idCampaign, TYPES.Int),
        new SpParam("nameCourse", req.nameCourse, TYPES.VarChar),
        new SpParam("descripctionCourse", req.descCourse, TYPES.VarChar),
        new SpParam("isPrivate", req.private, TYPES.Bit),
        new SpParam("urlImgCourse", req.urlImgCourse, TYPES.VarChar),
        new SpParam("idActivity", req.idActivity, TYPES.Int),
        new SpParam("context", req.context, TYPES.Int),
        SpParamTable2("table", insertSuperCourseTable, req.rows),
      ]);

    case "spInsertUser":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        SpParamTable2("table", insertUpdateUserTable, req.rows),
      ]);
    case "spQueryUsersDB":
      return parametrizacion([
        SpParamTable2("table", insertUpdateUserTable, req.rows),
      ]);
    case "spQueryLobCourses":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("campaign", req.idCampaign, TYPES.Int),
      ]);
    case "spQueryLearningPlan":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("idCampaign", req.idCampaign, TYPES.Int),
        new SpParam("idLob", req.idLob, TYPES.Int),
      ]);

    case "spInsertLearningPlan":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("nameLP", req.nameLP, TYPES.VarChar),
        new SpParam("descripctionLP", req.descLP, TYPES.VarChar),
        new SpParam("idCampaign", req.idCampaign, TYPES.Int),
        new SpParam("idLob", req.idLob, TYPES.Int),
        SpParamTable2("table", insertCoursesTable, req.rows),
      ]);

    case "spUpdateLp":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("idLP", req.idLP, TYPES.Int),
        new SpParam("idLob", req.idLob, TYPES.Int),
        new SpParam("nameLP", req.nameLP, TYPES.VarChar),
        new SpParam("descripctionLP", req.descLP, TYPES.VarChar),
        new SpParam("context", req.context, TYPES.Int),
        SpParamTable2("table", insertCoursesTable, req.rows),
      ]);

    case "spInsertWave":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("waveNumber", req.waveNumber, TYPES.VarChar),
        new SpParam("nameWave", req.nameWave, TYPES.VarChar),
        new SpParam("country", req.country, TYPES.VarChar),
        new SpParam("trainingType", req.trainingType, TYPES.VarChar),
        new SpParam("channel", req.channel, TYPES.VarChar),
        new SpParam("Language", req.lenguage, TYPES.VarChar),
        new SpParam("otherInfo", req.otherInfo, TYPES.VarChar),
      ]);

    case "spUpdatewave":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("idwave", req.idWave, TYPES.Int),
        new SpParam("nameWave", req.nameWave, TYPES.VarChar),
        new SpParam("trainingType", req.trainingType, TYPES.VarChar),
        new SpParam("channel", req.channel, TYPES.VarChar),
        new SpParam("Language", req.lenguage, TYPES.VarChar),
        new SpParam("otherInfo", req.otherInfo, TYPES.VarChar),
        new SpParam("waveNumber", req.waveNumber, TYPES.VarChar),
        new SpParam("Context", req.context, TYPES.Int),
      ]);

    case "spInsertLpWave":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("idwave", req.idWave, TYPES.Int),
        SpParamTable2("table", insertLPCWavesTable, req.rows),
      ]);

    case "spQueryWaves":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
      ]);

    case "spQueryLpWave":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("idwave", req.idWave, TYPES.Int),
      ]);

    case "spInsertMeeting":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("meetName", req.meetName, TYPES.VarChar),
        new SpParam("meetDescription", req.meetDescription, TYPES.VarChar),
        new SpParam("dateMeet", req.dateMeet, TYPES.Date),
        new SpParam("hourIniMeet", req.hourIniMeet, TYPES.VarChar),
        new SpParam("hourEndMeet", req.hourEndMeet, TYPES.VarChar),
        new SpParam("urlImgMeet", req.urlImgMeet, TYPES.VarChar),
        new SpParam("urlMeet", req.urlMeet, TYPES.VarChar),
      ]);

    case "spupdateMeeting":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("idMeet", req.idMeet, TYPES.Int),
        new SpParam("meetName", req.meetName, TYPES.VarChar),
        new SpParam("meetDescription", req.meetDescription, TYPES.VarChar),
        new SpParam("dateMeet", req.dateMeet, TYPES.Date),
        new SpParam("hourIniMeet", req.hourIniMeet, TYPES.VarChar),
        new SpParam("hourEndMeet", req.hourEndMeet, TYPES.VarChar),
        new SpParam("urlImgMeet", req.urlImgMeet, TYPES.VarChar),
        new SpParam("urlMeet", req.urlMeet, TYPES.VarChar),
        new SpParam("context", req.context, TYPES.Int),
      ]);

    case "spQueryMeet":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("date", req.date, TYPES.Date),
        new SpParam("context", req.context, TYPES.Int),
      ]);

    case "spQueryAnalitycs":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("context", req.context, TYPES.Int),
      ]);

    case "spQueryLpAgent":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("context", req.context, TYPES.Int),
      ]);

    case "spInsertEventAgent":
      return parametrizacion([
        new SpParam("user", req.requestedBy, TYPES.VarChar),
        new SpParam("idEvent", req.idEvent, TYPES.Int),
        new SpParam("idActivity", req.idActivity, TYPES.Int),
        new SpParam("dateOpen", req.dateOpen, TYPES.DateTime),
        new SpParam("timeToActivity", req.timeToActivity, TYPES.VarChar),
        new SpParam("typeConten", req.typeConten, TYPES.VarChar),
        new SpParam("progress", req.progress, TYPES.Int),
        new SpParam("timeVideo", req.timeVideo, TYPES.VarChar),
        new SpParam("timeView", req.timeView, TYPES.VarChar),
        new SpParam("views", req.views, TYPES.Int),
        new SpParam("context", req.context, TYPES.Int),
      ]);

    default:
      return null;
  }
};

let parame = (data) => {
  try {
    let obj = {
      table: [],
    };
    data.forEach((dato) => {
      let nombre = dato.item;
      let valor = dato.datos.valor;
      let tipo = dato.datos.tipo;
      let schema = dato.datos.schema || null;
      if (tipo == "table") {
        obj.table.push({
          nombre: nombre,
          valor: schemaRows(schema, valor),
          tipo: TYPES.TVP,
        });
      }
    });
    return obj.table;
  } catch (error) {
    console.log(error);
    return error;
  }
};

let schemaRows = (schema, valor) => {
  let c = [];
  if (schema == "JumpEmployee") {
    c = valor;
  }
  let table;
  if (schema == "JumpEmployee") {
    table = {
      columns: [
        {
          name: "idccms",
          type: TYPES.Int,
        },
        {
          name: "jumpRole",
          type: TYPES.VarChar,
        },
        {
          name: "site",
          type: TYPES.Int,
        },
        {
          name: "market",
          type: TYPES.Int,
        },
        {
          name: "workingDay",
          type: TYPES.VarChar,
        },
        {
          name: "phone",
          type: TYPES.BigInt,
        },
        {
          name: "email",
          type: TYPES.VarChar,
        },
        {
          name: "jumpCertificate",
          type: TYPES.VarChar,
        },
        {
          name: "certificateType",
          type: TYPES.VarChar,
        },
        {
          name: "currentStudy",
          type: TYPES.VarChar,
        },
        {
          name: "studyDay",
          type: TYPES.VarChar,
        },
        {
          name: "notEndedStudies",
          type: TYPES.VarChar,
        },
        {
          name: "semesterEnded",
          type: TYPES.VarChar,
        },
        {
          name: "Endedstudies",
          type: TYPES.VarChar,
        },
        {
          name: "title",
          type: TYPES.VarChar,
        },
        {
          name: "levelEnglish",
          type: TYPES.Int,
        },
        {
          name: "levelSQL",
          type: TYPES.Int,
        },
        {
          name: "levelExcel",
          type: TYPES.Int,
        },
      ],
      rows: c,
    };
  }

  console.log(table, "ssssssssss");
  return table;
};
