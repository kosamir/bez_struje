import express from "express";
import { index } from "./../controller/app.controller.js";
import { register } from "./../controller/register.controller.js";
import isAuth from "./../middleware/auth.middlware.js";

const router = express.Router();

router.route("/register").post(isAuth, register);
router.route("/").get(index);

export default router;
