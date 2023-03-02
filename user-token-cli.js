import jwt from "jsonwebtoken";
const getToken = () =>
  new Promise((resolve, reject) => {
    const payload = {
      password: "magicword"
    };
    jwt.sign(
      payload,
      "notwithoutmagicword",
      { expiresIn: "8s" },
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
    jwt.verify(token, "notwithoutmagicword", {}, (err, decoded) => {
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
}, 5000);
