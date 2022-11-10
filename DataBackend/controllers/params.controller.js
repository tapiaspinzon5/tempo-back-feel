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

let insertLobTable = [
  {
    name: "identTL",
    type: TYPES.Int,
  },
  {
    name: "case",
    type: TYPES.Int,
  },
  {
    name: "newTL",
    type: TYPES.Int,
  },
  {
    name: "newIdTeam",
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
