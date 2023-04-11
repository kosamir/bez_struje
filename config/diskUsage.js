import util from "util";
import { exec } from "child_process";

export const getDirectorySize = dir => {
  const child = exec(`du -sh ${dir}`, (err, stdout, stderr) => {
    console.log("stderr" + stderr);
    console.log("stdout" + stdout);

    if (err !== null) {
      console.log("exec error:" + err);
    }
  });
};
