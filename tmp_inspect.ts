import { COURSES } from "@/lib/courses-data";
import { MASTERCLASS_PRACTICE_EXTRAS } from "@/lib/masterclass-practice-extras";

const ids = ["masterkurs-queens-gambit","masterkurs-ruy-lopez","masterkurs-caro-kann","masterkurs-najdorf"];
for (const cid of ids) {
  const c = COURSES.find(x=>x.id===cid)!;
  const lessons = c.lessons;
  let withPL = 0, withExtras = 0, none = 0;
  const samples: string[] = [];
  for (const l of lessons) {
    const has = l.practiceLine && ((l.practiceLine.moves?.length||0)+(l.practiceLine.autoResponses?.length||0))>0;
    const ext = MASTERCLASS_PRACTICE_EXTRAS[l.id];
    if (has) withPL++;
    else if (ext) withExtras++;
    else { none++; samples.push(l.id); }
  }
  console.log(cid, "total:", lessons.length, "withPL:", withPL, "withExtras:", withExtras, "none:", none);
  if (samples.length) console.log("  missing:", samples.slice(0,8));
  const first = lessons[0];
  console.log("  first:", first.id, "pc:", first.practiceLine?.playerColor, "m:", first.practiceLine?.moves?.length, "a:", first.practiceLine?.autoResponses?.length, "fen:", first.practiceLine?.startFen?.slice(0,30));
}
