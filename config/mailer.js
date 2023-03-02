import { google } from "googleapis";
import logger from "./logger.js";
import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
const OAuth2 = google.auth.OAuth2;

export const getMailerGoogle = async () => {
  const myOauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  myOauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });
  const { token } = await myOauth2Client.getAccessToken();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: token
    }
  });
  return transporter;
};
export const sendRegistrationEmail = async (
  user,
  confirmationLink,
  validTime
) => {
  const transporter = await getMailerGoogle();
  const subject = `Registracija na uslugu Hep bez struje`;
  const emails = user.email;
  const mailOptions = {
    from: process.env.EMAIL,
    to: "Undisclosed Recipients",
    bcc: emails,
    subject: subject,
    template: "registration_mail_tmpl",
    context: {
      userName: user.email,
      address: user.street,
      city: user.dp,
      validUntil: validTime,
      confirmationLink: confirmationLink
    }
  };
  var options = {
    viewEngine: {
      extname: ".hbs",
      layoutsDir: "views/layouts/",
      defaultLayout: false,
      partialsDir: "views/partials/"
    },
    viewPath: "views/layouts/emails/",
    extName: ".hbs"
  };
  transporter.use("compile", hbs(options));

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    logger.error("sendMail error:" + error);
    logger.error("sendMail error:" + JSON.stringify(error));
  }
};

export const sendMail = async (data, datum) => {
  try {
    const transporter = await getMailerGoogle();
    const subject = `❗❗ Radovi HEP-a  datum ${datum} za ${data.grad}, područje ${data.pogon} ❗❗`;
    const emails = data.email;
    const mailOptions = {
      from: process.env.EMAIL,
      to: "Undisclosed Recipients",
      bcc: emails,
      subject: subject,
      template: "notification_mail_tmpl",
      context: {
        userName: data.email,
        data: data.data,
        datum: datum,
        unsubscribeLink: data.unsubscribeLink
      }
    };
    var options = {
      viewEngine: {
        extname: ".hbs",
        layoutsDir: "views/layouts/",
        defaultLayout: false,
        partialsDir: "views/partials/"
      },
      viewPath: "views/layouts/emails/",
      extName: ".hbs"
    };
    transporter.use("compile", hbs(options));
    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      logger.error("sendMail error:" + error);
      logger.error("sendMail error:" + JSON.stringify(error));
    }
  } catch (err) {
    logger.error(err);
  }
};
