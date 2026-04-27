// "My Lessons" — AI-generated personalised opening lessons saved from games.
// Shown inline on the Learn page so the user can revisit and drill what the
// coach pulled from their actual play.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap, ChevronDown, ChevronUp, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface CustomLesson {
  id: string;
  title: string;
  opening_name: string;
  opening_eco: string | null;
  summary: string;
  key_ideas: string[];
  recommended_moves: { san: string; why: string }[];
  practice_lines: { name: string; moves: string[]; note: string }[];
  source_game_id: string | null;
  created_at: string;
}

export default function MyLessonsPanel() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<CustomLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("custom_lessons")
        .select("*")
        .order("created_at", { ascending: false });
      if (!cancelled) {
        setLessons((data ?? []) as unknown as CustomLesson[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("custom_lessons").delete().eq("id", id);
    if (error) {
      toast({ title: "Could not delete lesson", variant: "destructive" });
      return;
    }
    setLessons(prev => prev.filter(l => l.id !== id));
  };

  if (!user) return null;
  if (loading) return null;
  if (lessons.length === 0) {
    return (
      <div className="mb-8 rounded-xl border border-dashed border-primary/25 bg-primary/5 p-5 text-center">
        <GraduationCap className="w-5 h-5 text-primary mx-auto mb-2" />
        <p className="text-sm text-foreground font-medium">No personalised lessons yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Finish an online game and tap <span className="text-primary">Coach Review</span> to generate one from your own play.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-xl border border-primary/25 bg-gradient-to-br from-primary/5 to-transparent p-5">
      <div className="flex items-center gap-2 mb-3">
        <GraduationCap className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm font-semibold text-foreground">My Lessons</h3>
        <span className="ml-auto text-[10px] text-muted-foreground">{lessons.length} saved</span>
      </div>
      <div className="space-y-2">
        {lessons.map(l => {
          const open = openId === l.id;
          return (
            <div key={l.id} className="rounded-lg border border-border/40 bg-card/80 overflow-hidden">
              <button
                onClick={() => setOpenId(open ? null : l.id)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/20 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{l.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {l.opening_eco ? <span className="font-mono mr-1.5">{l.opening_eco}</span> : null}
                    {l.opening_name}
                  </p>
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {open && (
                <div className="px-4 pb-4 space-y-3 border-t border-border/30">
                  <p className="text-xs sm:text-sm text-foreground/90 mt-3">{l.summary}</p>
                  {l.key_ideas?.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Key ideas</p>
                      <ul className="space-y-1 text-xs text-foreground/90">
                        {l.key_ideas.map((k, i) => <li key={i}>• {k}</li>)}
                      </ul>
                    </div>
                  )}
                  {l.recommended_moves?.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Repertoire moves</p>
                      <ul className="space-y-1 text-xs">
                        {l.recommended_moves.map((m, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="font-mono font-bold text-primary min-w-[3ch]">{m.san}</span>
                            <span className="text-foreground/85">{m.why}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {l.practice_lines?.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Practice lines</p>
                      <div className="space-y-2">
                        {l.practice_lines.map((p, i) => (
                          <div key={i} className="rounded-md border border-border/30 bg-background/60 p-2.5">
                            <p className="text-xs font-medium text-foreground">{p.name}</p>
                            <p className="text-[11px] font-mono text-primary/90 mt-0.5">{p.moves.join(" ")}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">{p.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    {l.source_game_id ? (
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/game-review?game=${l.source_game_id}`}>Open source game</Link>
                      </Button>
                    ) : <span />}
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => remove(l.id)}>
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
