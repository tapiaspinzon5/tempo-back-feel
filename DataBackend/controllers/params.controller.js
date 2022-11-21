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
        new SpParam("ident", req.requestedBy, TYPES.Int),
        new SpParam("nameCampaign", req.nameCampaign, TYPES.VarChar),
        SpParamTable2("table", insertCampaignTable, req.rows),
      ]);
    case "spUpdateCampaign":
      return parametrizacion([
        new SpParam("ident", req.requestedBy, TYPES.Int),
        new SpParam("idCampaign", req.idCampaign, TYPES.Int),
        new SpParam("context", req.context, TYPES.Int),
        SpParamTable2("table", updateCampaignTable, req.rows),
      ]);
    case "spQueryCampaignContent":
      return parametrizacion([
        new SpParam("ident", req.requestedBy, TYPES.Int),
        new SpParam("context", req.context, TYPES.Int),
        new SpParam("idcampaign", req.idCampaign, TYPES.Int),
        new SpParam("idlob", req.idLob, TYPES.Int),
        new SpParam("idLearningPlan", req.idLearningPlan, TYPES.Int),
      ]);
    case "spQueryUsersMD":
      return parametrizacion([
        new SpParam("ident", req.idccms, TYPES.Int),
        new SpParam("Context", req.context, TYPES.Int),
      ]);
    case "spQueryRoleUser":
      return parametrizacion([new SpParam("ident", req.idccms, TYPES.Int)]);

    case "spInsertCourse":
      return parametrizacion([
        new SpParam("ident", req.requestedBy, TYPES.Int),
        new SpParam("idCampaign", req.idCampaign, TYPES.Int),
        new SpParam("nameCourse", req.nameCourse, TYPES.VarChar),
        new SpParam("descripctionCourse", req.descCourse, TYPES.VarChar),
        new SpParam("isPrivate", req.private, TYPES.Bit),
        SpParamTable2("table", insertSuperCourseTable, req.rows),
      ]);
    case "spQueryCourses":
      return parametrizacion([
        new SpParam("ident", req.requestedBy, TYPES.Int),
        new SpParam("idCampaign", req.idCampaign, TYPES.Int),
      ]);
    case "spQueryUser":
      return parametrizacion([
        new SpParam("ident", req.requestedBy, TYPES.Int),
        new SpParam("IdMin", req.start, TYPES.Int),
        new SpParam("IdMax", req.end, TYPES.Int),
      ]);
    case "spUpdateUser":
      return parametrizacion([
        new SpParam("ident", req.requestedBy, TYPES.Int),
        new SpParam("Context", req.context, TYPES.Int),
        SpParamTable2("table", updateUserTable, req.rows),
      ]);
    case "spUpdateCourse":
      return parametrizacion([
        new SpParam("ident", req.requestedBy, TYPES.Int),
        new SpParam("idCourse", req.idCourse, TYPES.Int),
        new SpParam("contex", req.context, TYPES.Int),
        SpParamTable2("table", insertSuperCourseTable, req.rows),
      ]);
    case "spInsertLearningPlan":
      return parametrizacion([
        new SpParam("ident", req.requestedBy, TYPES.Int),
        new SpParam("nameLP", req.nameLP, TYPES.VarChar),
        new SpParam("descripctionLP", req.descriptionLP, TYPES.VarChar),
        new SpParam("idCampaign", req.idCampaign, TYPES.Int),
        new SpParam("idLob", req.idLob, TYPES.Int),
        SpParamTable2("table", insertSuperCourseTable, req.rows),
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
