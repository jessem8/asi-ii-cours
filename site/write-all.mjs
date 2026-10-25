import "./write-core.mjs";
import "./write-lessons.mjs";
import "./write-labs.mjs";
import { quizErrors } from "./lib.mjs";
if (quizErrors.length) {
  console.log("QUIZ WORD MISMATCHES " + quizErrors.length);
  for (const e of quizErrors) console.log(e);
}
