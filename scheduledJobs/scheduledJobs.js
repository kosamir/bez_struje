import cron from "node-cron";
import { hepCrawler } from "../config/hepCrawler.js";
import logger from "../config/logger.js";
import { sendMail, getMailerGoogle } from "../config/mailer.js";
import User from "../models/user.model.js";

export const initScheduledJobs = () => {
  /*
   * run every monday-saturday at midnight
   */
  const clearJunk = cron.schedule(
    "0 0 0 * * 1-6",
    async () => {
      logger.info("Clearing junk from database time:" + new Date());
      const deletedCount = await User.clearJunk();
      let trans = getMailerGoogle();

      let mail = (await trans).sendMail({
        from: process.env.EMAIL,
        to: "amir.kos@gmail.com",
        subject: "gmail still running",
        text: `Deleted count: ${deletedCount}`
      });

      logger.info(`Email sent :${mail.response}`);
      logger.info(`Clearing junk from database deletedCount:${deletedCount}`);
    },
    { scheduled: true, timezone: "Europe/Zagreb" }
  );

  /*
   * run monday to saturday at 7:30 AM
   */
  const tick = cron.schedule(
    //   "* * * * *",
    "00 30 7 * * 1-6",
    async () => {
      logger.info("Notification job dateTime:" + new Date());
      try {
        for await (const user of User.find({
          is_active: true
        })) {
          const [results, grad, pogon] = await hepCrawler(
            user.dp,
            user.dp_child
          );
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
    },
    { scheduled: true, timezone: "Europe/Zagreb" }
  );
  clearJunk.start();
  tick.start();
};
export default initScheduledJobs;
