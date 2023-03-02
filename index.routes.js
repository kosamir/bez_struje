import express from "express";
import appRoutes from "./routes/app.routes.js";
import registerRoutes from "./routes/register.routes.js";

const router = express.Router();
router.use("/", appRoutes);
router.use("/register", registerRoutes);
export default router;
