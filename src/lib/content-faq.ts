// Per-topic FAQ generators for the programmatic content pages.
// Answers are derived from the page's own data — never invented facts.
import type { FaqItem } from "@/lib/seo-faq";
import type { MatePattern } from "@/data/matePatterns";
import type { FamousGame } from "@/data/famousGames";
import type { Grandmaster } from "@/data/grandmasters";
import type { GlossaryTerm } from "@/data/chessGlossary";

export function mateFaq(m: MatePattern): FaqItem[] {
  return [
    { q: `What is the ${m.name} in chess?`, a: m.short },
    {
      q: `How do you deliver the ${m.name}?`,
      a: `From the example position on this page the forced sequence is ${m.moves}. Step through it on the board above, then switch to "Try it yourself" and play the moves.`,
    },
    {
      q: `Is the ${m.name} hard to learn?`,
      a: `It is rated ${m.difficulty} here. ${
        m.difficulty === "beginner"
          ? "You can recognise it after a handful of games."
          : m.difficulty === "intermediate"
            ? "Expect to need some pattern practice before you spot it under time pressure."
            : "It usually needs concrete calculation, so practise it against a bot before trusting it in a rated game."
      }`,
    },
    {
      q: `Where can I practise the ${m.name} for free?`,
      a: "Play a free game on MasterChess — no account, no download, no ads. Bots from 400 to 2000 ELO let you set up the pattern deliberately.",
    },
  ];
}

export function famousGameFaq(g: FamousGame): FaqItem[] {
  const winner = g.result === "1-0" ? g.white : g.result === "0-1" ? g.black : null;
  return [
    {
      q: `Who won ${g.white} vs ${g.black} (${g.year})?`,
      a: winner
        ? `${winner} won. The game was played at ${g.event} in ${g.year} and finished ${g.result}.`
        : `The game was drawn (${g.result}), played at ${g.event} in ${g.year}.`,
    },
    { q: `What opening was played in ${g.title}?`, a: `${g.opening}${g.eco ? ` (ECO ${g.eco})` : ""}.` },
    { q: `Why is ${g.title} famous?`, a: g.legacy },
    {
      q: `Can I replay ${g.title} move by move?`,
      a: "Yes — use the board on this page to step through every move, or take over the position at any point and finish the game yourself.",
    },
  ];
}

export function grandmasterFaq(p: Grandmaster): FaqItem[] {
  return [
    {
      q: `Who is ${p.name}?`,
      a: `${p.bio}`,
    },
    {
      q: `What was ${p.name}'s peak rating?`,
      a: `${p.peakRating}. ${p.worldChampionYears ? `World champion ${p.worldChampionYears}.` : ""}`.trim(),
    },
    { q: `What is ${p.name}'s playing style?`, a: p.style },
    {
      q: `How can I play like ${p.name}?`,
      a: `Study the games listed on this page, then practise the same structures in a free game on MasterChess against a bot at your level.`,
    },
  ];
}

export function glossaryFaq(t: GlossaryTerm): FaqItem[] {
  return [
    { q: `What does ${t.term} mean in chess?`, a: t.short },
    { q: `${t.term} — explained in more detail`, a: t.long.slice(0, 600) },
    {
      q: `How do I practise ${t.term.toLowerCase()}?`,
      a: "Start a free game on MasterChess and look for the pattern deliberately. After the game, use the manual review to check where it appeared.",
    },
  ];
}
