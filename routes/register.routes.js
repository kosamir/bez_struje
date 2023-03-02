import express from "express";
import {
  unsubscribe,
  validateRegistration
} from "./../controller/register.controller.js";
const router = express.Router();
router.route("/validate/:validation_link").get(validateRegistration);
router.route("/unsubscribe/:email").get(unsubscribe);
export default router;
