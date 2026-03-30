import { useState } from "react";
import { Shield, Users, Trophy, Plus, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Club {
  id: string;
  name: string;
  description: string;
  members: number;
  rating: number;
  icon: string;
}

const SAMPLE_CLUBS: Club[] = [
  { id: "1", name: "Grandmaster Academy", description: "For serious competitive players aiming for the top", members: 234, rating: 1650, icon: "🏆" },
  { id: "2", name: "Casual Knights", description: "Relaxed games and friendly community", members: 512, rating: 1100, icon: "♞" },
  { id: "3", name: "Blitz Warriors", description: "Speed chess enthusiasts unite", members: 187, rating: 1400, icon: "⚡" },
  { id: "4", name: "Opening Masters", description: "Study and practice chess openings together", members: 143, rating: 1350, icon: "📚" },
  { id: "5", name: "Endgame Specialists", description: "Master the art of endgames", members: 98, rating: 1500, icon: "🎯" },
  { id: "6", name: "Weekly Tournament Club", description: "Regular tournaments every week", members: 321, rating: 1250, icon: "🏅" },
];

const Clubs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [joinedClubs, setJoinedClubs] = useState<string[]>([]);

  const filtered = SAMPLE_CLUBS.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 pt-24 pb-16 text-center">
          <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Clubs</h1>
          <p className="text-muted-foreground mb-6">Log in to join chess clubs.</p>
          <Button onClick={() => navigate("/login")}>Log In</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-7 w-7 text-primary" /> Clubs
          </h1>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Create Club
          </Button>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clubs..."
              className="pl-9"
            />
          </div>

          <div className="space-y-2">
            {filtered.map(club => {
              const joined = joinedClubs.includes(club.id);
              return (
                <div key={club.id} className="rounded-xl border border-border/40 bg-card/80 p-4 flex items-center gap-4 hover:border-primary/30 transition-all">
                  <div className="text-3xl">{club.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{club.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{club.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> {club.members} members
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Trophy className="h-3 w-3" /> Avg {club.rating}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={joined ? "outline" : "default"}
                    onClick={() => {
                      setJoinedClubs(prev =>
                        joined ? prev.filter(id => id !== club.id) : [...prev, club.id]
                      );
                    }}
                  >
                    {joined ? "Joined" : "Join"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Clubs;
