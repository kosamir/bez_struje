import { LocalDate, LocalDateTime } from "@js-joda/core";
import bcrypt, { hash } from "bcrypt";
import { default as createError } from "http-errors";
import User from "../models/user.model.js";
import logger from "./../config/logger.js";
import { sendRegistrationEmail } from "./../config/mailer.js";

export const register = async (req, res, next) => {
  const { email, dp, dp_child, street } = req.body;
  if (!email || !street || !dp || !dp_child) {
    return next(createError((400, "Bad request")));
  }
  const toHash = email + street + dp + dp_child;
  const hashed = encodeURIComponent(
    await hash(toHash, await bcrypt.genSalt(10))
  );
  const newUser = new User({
    email: email,
    street: street.toUpperCase(),
    city: dp.toUpperCase(),
    dp: dp,
    dp_child: dp_child,
    validation_link: hashed,
    is_active: false
  });

  let user;
  try {
    try {
      user = await newUser.save();
    } catch (err) {
      if (err.code === 11000) {
        return next(createError((409, `Email: ${email} is already taken!!`)));
      }
      return next(createError(500, err));
    }
    if (!user) {
      return next(createError(500, err));
    }
    const confirmationLink = `${process.env.API_HOST}/register/validate/${hashed}`;
    const tomorow = LocalDate.now();
    const until = LocalDateTime.of(
      tomorow.year(),
      tomorow.monthValue(),
      tomorow.dayOfMonth()
    );
    await sendRegistrationEmail(
      user,
      confirmationLink,
      until.toString().replace("T", " ")
    );
  } catch (err) {
    logger.error(err.toString());
    return next(createError(500, err));
  }

  res.status(200).json(user);
};

export const unsubscribe = async (req, res, next) => {
  const email = req.params.email;
  if (!email) {
    return next(createError(409, "Bad request"));
  }
  let user;
  try {
    user = await User.findOneAndUpdate(
      { email: email },
      { $set: { is_active: false } },
      {
        new: true
      }
    );
    if (!user) {
      return next(createError(409, `${email} not found`));
    }
  } catch (err) {
    return next(createError(500, err));
  }
  return res.status(200).json({ message: "Unsubscribed!" });
};

export const validateRegistration = async (req, res, next) => {
  const link = encodeURIComponent(req.params.validation_link);
  if (!link) {
    return next(createError(409, "Bad request"));
  }
  let user;
  try {
    user = await User.findOneAndUpdate(
      { validation_link: link },
      { $set: { is_active: true, activation_date: new Date() } },
      {
        new: true
      }
    );
    if (!user) {
      return next(createError(500, "User not found"));
    }
  } catch (err) {
    return next(createError(500, err));
  }
  return res.status(200).json({
    message: ` ${user.email} subscribed!!!`
  });
};
