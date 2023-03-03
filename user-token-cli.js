import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
console.log(process.env);
const getToken = () =>
  new Promise((resolve, reject) => {
    const payload = {
      password: process.env.API_MAGIC_WORD
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
      (err, token) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        return resolve(token);
      }
    );
  });
const token = await getToken();

const verify = token =>
  new Promise((resolve, re) => {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, decoded) => {
      if (err) resolve(err);
      resolve(decoded);
    });
  });

function isExpired(expDate) {
  const currentDate = Math.floor(Date.now() / 1000);
  return currentDate > expDate;
}
//playground
console.log(token);
console.log(await verify(token));
const decoded = jwt.decode(token);
console.log(decoded);
setTimeout(() => {
  console.log(isExpired(decoded.exp));
}, 26000);
