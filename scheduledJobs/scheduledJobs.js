import cron from "node-cron";
import { hepCrawler } from "../config/hepCrawler.js";
import logger from "../config/logger.js";
import { sendMail } from "../config/mailer.js";
import User from "../models/user.model.js";

export const initScheduledJobs = () => {
  /*
   * run every day midnight
   */
  const clearJunk = cron.schedule("0 0 0 * * *", async () => {
    logger.info("Clearing junk from database");
    const deletedCount = await User.clearJunk();
    logger.info(`Clearing junk from database deletedCount:${deletedCount}`);
  });

  /*
   * run every day monday-saturday at 12am
   */
  const tick = cron.schedule("00 00 12 * * 0-6", async () => {
    try {
      for await (const user of User.find({
        is_active: true
      })) {
        const [results, grad, pogon] = await hepCrawler(user.dp, user.dp_child);
        for await (const res of results) {
          if (
            res.ulice
              .toString()
              .toUpperCase()
              .includes(user.street.toString().toUpperCase())
          ) {
            const body = {
              data: res,
              grad: grad,
              pogon: pogon,
              email: user.email,
              unsubscribeLink: `${process.env.API_HOST}/register/unsubscribe/${user.email}`
            };
            await sendMail(body, res.datum);
            logger.info(`Notification mail sent to ${user.email}`);
          }
        }
      }
    } catch (err) {
      logger.error(`Houston we got a problem: ${err}`);
    }
  });
  clearJunk.start();
  tick.start();
};
export default initScheduledJobs;
