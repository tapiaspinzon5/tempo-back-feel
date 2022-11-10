require("dotenv").config();
if (process.env.ENV == "Production" || process.env.ENV == "Development") {
  module.exports = {
    configtest: {
      server: Buffer.from(process.env.IP_SQL, "base64").toString(),
      authentication: {
        type: process.env.TYPE,
        options: {
          userName: Buffer.from(process.env.SQL_USERNAME, "base64").toString(),
          password: Buffer.from(process.env.SQL_PASSWORD, "base64").toString(),
        },
      },
      driver: process.env.DRIVER,
      options: {
        instanceName: Buffer.from(process.env.INSTANCE, "base64").toString(),
        database: Buffer.from(process.env.DATABASE, "base64").toString(),
        rowCollectionOnDone: true,
        rowCollectionOnRequestCompletion: true,
        connectTimeout: 300000,
        requestTimeout: 300000,
        trustServerCertificate: true,
        // port: 5081, //solo se habilita en PRD
      },
    },
    PORT: process.env.PORT || process.env.APP_PORT,
    valor: { secret: process.env.SECRET },
    ENV: process.env.ENV,
    headersl: {
      [process.env.CTTYPE]: process.env.CTVALUE,
      [process.env.ACLO]: process.env.ACLOV,
    },
    headers: {
      [process.env.CTTYPE]: process.env.CTVALUE,
      [process.env.ACLO]: process.env.ACLOV,
    },
  };
}
