import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import app from "./config/express.js";
import initScheduledJobs from "./scheduledJobs/scheduledJobs.js";
import logger from "./config/logger.js";
dotenv.config();
async function main() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.MONGO_DB_URL, { useNewUrlParser: true });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
  initScheduledJobs();
  var server = http.createServer(app);
  server.listen(process.env.PORT, async () => {
    logger.info(`Server running on port ${process.env.PORT}`);
  });
}

main();
export const App = app;
