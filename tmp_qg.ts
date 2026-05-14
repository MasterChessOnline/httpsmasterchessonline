import { COURSES } from "@/lib/courses-data";
const c = COURSES.find(x=>x.id==="masterkurs-queens-gambit")!;
const l = c.lessons.find(x=>x.id==="qg-1")!;
console.log("playerColor:", l.practiceLine?.playerColor);
console.log("startFen:", l.practiceLine?.startFen);
console.log("moves:", l.practiceLine?.moves.map((m:any)=>m.move));
console.log("auto:", l.practiceLine?.autoResponses);
