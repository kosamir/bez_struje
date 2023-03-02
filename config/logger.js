import { createLogger, format, transports } from "winston";
import winston from "winston";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();
const logDir =
  process.env.NODE_ENV === "development"
    ? `${process.env.LOGFILES_LOCAL}`
    : `${process.env.LOGFILES_SERVER}`;

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const colorizer = winston.format.colorize();
const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.File({
      filename: `${logDir}/all-logs.log`,
      json: false,
      maxsize: 5242880,
      maxFiles: 5
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple(),
        winston.format.printf(msg =>
          colorizer.colorize(
            msg.level,
            `${msg.timestamp} - ${msg.level}: ${msg.message}`
          )
        )
      )
    })
  ]
});

export default logger;
