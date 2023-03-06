const properties = require("../properties/properties");
const logger = require("../utils/logger");
const Connection = require("tedious").Connection;
const Request = require("tedious").Request;
const TYPES = require("tedious").TYPES;

exports.query = (storedProcedure, parametros) => {
  return new Promise((resolve, reject) => {
    let conn = new Connection(properties.configtest);
    conn.on("connect", (err) => {
      if (err) {
        logger.error(err);
        reject("error while connecting server");
      } else {
        let request = new Request(storedProcedure, (err, rowCount, rows) => {
          if (err) {
            logger.error(
              `error proc: ${err.procName} - message: ${err.message} - procline: ${err.lineNumbe}`
            );
            reject("error in query execution");
          } else {
            conn.close();
            injectjson(rows).then((valor) => {
              try {
                const temp = valor[0].Result
                  ? JSON.parse(valor[0].Result)
                  : valor;
                resolve(temp);
              } catch (error) {
                resolve(valor);
                reject("error in query result");
              }
            });
          }
        });
        if (parametros) {
          try {
            parametros.forEach((valor) => {
              request.addParameter(valor.nombre, valor.tipo, valor.valor);
            });
          } catch (error) {
            logger.error(error);
          }
        }

        request.on("requestCompleted", () => {
          conn.close();
        });
        request.on("error", (err) => {
          logger.error(err);
          reject(err);
        });
        try {
          conn.callProcedure(request);
        } catch (error) {
          logger.error(error);
        }
      }
    });
    conn.on("error", (err) => {
      logger.error(err);
      reject(err);
      reject("error connecting server");
      conn.close();
    });
    conn.connect();
  });
};

let injectjson = (rows) => {
  return new Promise((resolve, reject) => {
    let jsonArray = [];
    rows.forEach((columns) => {
      let rowObject = {};
      columns.forEach((column) => {
        rowObject[column.metadata.colName] = column.value;
      });
      jsonArray.push(rowObject);
    });
    resolve(jsonArray);
  });
};
