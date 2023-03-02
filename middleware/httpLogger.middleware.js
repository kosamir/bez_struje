import morgan from "morgan";
import logger from "../config/logger.js";

logger.stream = {
  write: message => logger.info(message.substring(0, message.lastIndexOf("\n")))
};
morgan.token("body", (req, res) => JSON.stringify(req.body));
export default morgan(
  ":method :url :status :response-time ms - :res[content-length] :body - :req[content-length]",
  { stream: logger.stream }
);
