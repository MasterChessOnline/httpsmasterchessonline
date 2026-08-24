import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Compass, UserPlus, UserCheck, User } from "lucide-react";
import { toast } from "sonner";
import RankBadge from "@/components/RankBadge";

interface Suggestion {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  rating: number;
  games_played: number;
}

/**
 * "Discover new people" — real players from the database the viewer is not
 * following yet, with a one-tap follow. No fake/ghost accounts.
 */
const DiscoverPlayers = ({ viewerId }: { viewerId?: string | null }) => {
  const [people, setPeople] = useState<Suggestion[]>([]);
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id,display_name,username,avatar_url,rating,games_played")
        .order("games_played", { ascending: false })
        .limit(30);

      let rows = (data as Suggestion[] | null) ?? [];

      if (viewerId) {
        const { data: fl } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", viewerId);
        const already = new Set((fl ?? []).map((r: any) => r.following_id));
        rows = rows.filter((p) => p.user_id !== viewerId && !already.has(p.user_id));
      }

      if (!cancelled) {
        setPeople(rows.slice(0, 6));
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [viewerId]);

  const follow = async (targetId: string) => {
    if (!viewerId) {
      toast.info("Create a free account to follow players");
      return;
    }
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: viewerId, following_id: targetId });
    if (error) {
      toast.error(error.message);
      return;
    }
    setFollowed((s) => ({ ...s, [targetId]: true }));
    toast.success("Following ✓");
  };

  if (loading || people.length === 0) return null;

  return (
    <section className="rounded-xl border border-border/50 bg-card/70 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Compass className="h-4 w-4 text-primary" />
        <h2 className="font-display text-sm font-bold text-foreground">Discover new people</h2>
      </div>

      <ul role="list" className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
        {people.map((p) => {
          const name = p.display_name || p.username || "Player";
          return (
            <li
              key={p.user_id}
              className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/10 p-2.5"
            >
              <Link to={`/profile/${p.user_id}`} className="shrink-0">
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-primary/30 bg-primary/10">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={`${name} avatar`} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <User className="h-4 w-4 text-primary" />
                  )}
                </span>
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/profile/${p.user_id}`} className="block truncate text-sm font-semibold text-foreground hover:text-primary">
                  {name}
                </Link>
                <div className="mt-0.5 flex items-center gap-2">
                  <RankBadge rating={p.rating} size="sm" />
                  <span className="text-[10px] text-muted-foreground">{p.games_played} games</span>
                </div>
              </div>
              <Button
                size="sm"
                variant={followed[p.user_id] ? "outline" : "secondary"}
                onClick={() => follow(p.user_id)}
                disabled={!!followed[p.user_id]}
                aria-label={`Follow ${name}`}
              >
                {followed[p.user_id] ? <UserCheck className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default DiscoverPlayers;
