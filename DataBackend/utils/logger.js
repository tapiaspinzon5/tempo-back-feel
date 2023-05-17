const { format, createLogger, transports } = require("winston");
const { combine, timestamp, label, printf, prettyPrint } = format;

const logger = createLogger({
  level: "debug",
  format: combine(
    format.errors({ stack: true }),
    timestamp({
      format: "MMM-DD-YYYY HH:mm:ss",
    }),
    prettyPrint()
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.json(), format.simple()),
    }),
  ],
});

module.exports = logger;
