import jwt from "jsonwebtoken";
import {
  getBrowser,
  getDistributionAreaSelect,
  getDistributionAreaSelectChild
} from "./../config/hepCrawler.js";

export const index = async (req, res, next) => {
  let first, second;
  if (req.query.dp) {
    first = await getDistributionAreaSelect();
    second = await getDistributionAreaSelectChild(req.query.dp);
    const b = await getBrowser();
    console.log(b);
  } else {
    first = await getDistributionAreaSelect();
  }
  let magicword = jwt.sign(
    { password: process.env.API_MAGIC_WORD },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  res.render("index", {
    title:
      "Registracija na uslugu izvješćivanja o nestanku struje uslijed radova na električnoj mreži",
    select: first,
    select2: second,
    magicword: `'${magicword}'`
  });
};
