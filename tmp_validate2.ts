import { Chess } from "chess.js";
import { COURSES } from "@/lib/courses-data";
import { MASTERCLASS_PRACTICE_EXTRAS } from "@/lib/masterclass-practice-extras";

function build(lesson:any){
  const pl = (lesson.practiceLine && (lesson.practiceLine.moves?.length || lesson.practiceLine.autoResponses?.length)) ? lesson.practiceLine : MASTERCLASS_PRACTICE_EXTRAS[lesson.id];
  if (!pl) return null;
  let first:"w"|"b"="w"; if(pl.startFen && pl.startFen.split(" ")[1]==="b") first="b";
  const playerFirst = first===pl.playerColor;
  const game = pl.startFen ? new Chess(pl.startFen) : new Chess();
  const out:string[]=[]; let pi=0,ai=0,turn=playerFirst;
  const total=(pl.moves?.length??0)+(pl.autoResponses?.length??0);
  const tryQ=(q:"p"|"a")=>{
    if(q==="p" && pi<pl.moves.length){try{if(game.move(pl.moves[pi].move)){out.push(pl.moves[pi].move);pi++;return true;}}catch{}}
    else if(q==="a" && ai<pl.autoResponses.length){try{if(game.move(pl.autoResponses[ai])){out.push(pl.autoResponses[ai]);ai++;return true;}}catch{}}
    return false;
  };
  for(let i=0;i<total;i++){
    const p=turn?"p":"a", f=turn?"a":"p";
    let ok=tryQ(p); if(!ok) ok=tryQ(f);
    if(!ok){ if(p==="p"&&pi<pl.moves.length)pi++; else if(p==="a"&&ai<pl.autoResponses.length)ai++; else if(pi<pl.moves.length)pi++; else if(ai<pl.autoResponses.length)ai++; else break;}
    turn=!turn;
  }
  return out;
}

for (const cid of ["masterkurs-queens-gambit","masterkurs-ruy-lopez","masterkurs-caro-kann","masterkurs-najdorf"]) {
  const c = COURSES.find(x=>x.id===cid)!;
  let zero=0, lens:number[]=[];
  for (const l of c.lessons){ const m=build(l)||[]; lens.push(m.length); if(m.length===0)zero++; }
  const avg=(lens.reduce((a,b)=>a+b,0)/lens.length).toFixed(1);
  console.log(cid, "lessons:",c.lessons.length,"empty:",zero,"avgPlies:",avg,"min:",Math.min(...lens),"max:",Math.max(...lens));
}
