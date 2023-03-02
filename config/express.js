import express from "express";
import routes from "./../index.routes.js";
import errorHandler from "./../middleware/errorHandler.middleware.js";
import httpLogger from "./../middleware/httpLogger.middleware.js";
import { engine } from "express-handlebars";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(httpLogger);
app.use("/", routes);
app.engine(
  "hbs",
  engine({
    layoutsDir: "./views/layouts",
    extname: "hbs"
  })
);
app.set("view engine", "hbs");
app.use(express.static("public"));

app.use("*", function(req, res, next) {
  res.status(404).json({ message: "404 - NOT FOUND" });
});
// ovo na kraj mora doci zbog next()
app.use(errorHandler);
export default app;
