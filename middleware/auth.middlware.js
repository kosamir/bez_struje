import { default as createError } from "http-errors";
import jwt from "jsonwebtoken";
export default async function(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return next(createError(401, "Unauthorized"));
  }
  /* Strip Bearer prefix from authorization header */
  const accessToken = token.slice(7, token.length);
  /* Check  expiration of token  */
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    if (isExpired(decoded.exp)) {
      return next(createError(401, "Unauthorized"));
    }
    next();
  } catch (err) {
    return next(createError(401, "Unauthorized"));
  }
}

function isExpired(expDate) {
  const currentDate = Math.floor(Date.now() / 1000);
  return currentDate > expDate;
}
