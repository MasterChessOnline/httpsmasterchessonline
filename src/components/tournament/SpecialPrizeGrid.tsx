// SpecialPrizeGrid — the 10 special prize categories for DB Cup.
// Static, marketing-first. Backed by tournament_prizes(category) for prize ladder editing later.
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Flag, Trophy, Award, Star, Users, Coins, Shield, GraduationCap } from "lucide-react";

const SPECIAL_PRIZES = [
  { icon: Crown,          tint: "text-yellow-300",  title: "Champion + Runner-up + Third",
    prize: "50k / 25k / 15k Master Coins · 1-year Pro · animated trophy on profile · founder 1-on-1 lesson for the winner" },
  { icon: Trophy,         tint: "text-amber-300",   title: "Top-10 finishers",
    prize: "2,000 coins each + Brakus Knight badge" },
  { icon: Sparkles,       tint: "text-fuchsia-300", title: "Brilliancy Prize",
    prize: "10,000 coins for the best game · voted by community · featured on homepage for 7 days" },
  { icon: Award,          tint: "text-emerald-300", title: "Biggest Upset",
    prize: "5,000 coins + Upset Hunter badge for the largest rating-diff win" },
  { icon: Shield,         tint: "text-red-300",     title: "Fighting Spirit",
    prize: "5,000 coins to the top-50 finisher with the fewest draws" },
  { icon: GraduationCap,  tint: "text-cyan-300",    title: "Junior Prize · U16",
    prize: "Highest-placed player born 2010 or later — exclusive Junior Cup badge + 5,000 coins" },
  { icon: Star,           tint: "text-orange-300",  title: "Veteran Prize · 50+",
    prize: "Highest-placed player aged 50+ — Veteran Crown badge + 5,000 coins" },
  { icon: Flag,           tint: "text-sky-300",     title: "Country Cup",
    prize: "Top 3 countries by sum-of-top-5 scores — every member of the winning federation gets a national badge" },
  { icon: Users,          tint: "text-pink-300",    title: "Top Ambassador",
    prize: "Most confirmed invites — 10,000 coins + Brakus Ambassador permanent profile flair" },
  { icon: Coins,          tint: "text-yellow-300",  title: "Lucky Survivor",
    prize: "Random pick from everyone who plays all 9 rounds — 5,000 coins" },
];

export default function SpecialPrizeGrid() {
  return (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold">10 special prize categories</h2>
        <Badge variant="outline" className="text-xs border-yellow-500/40 text-yellow-300">
          No cash · pure MasterChess rewards
        </Badge>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {SPECIAL_PRIZES.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.title} className="p-4 border-white/10 hover:border-yellow-500/30 transition-colors">
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${p.tint}`} />
                <div>
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{p.prize}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
