import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface RatingRow {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface ProfileLite {
  user_id: string;
  display_name: string | null;
  avatar_url?: string | null;
}

export default function SiteRating() {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [myRating, setMyRating] = useState<RatingRow | null>(null);
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("site_ratings")
      .select("id,user_id,rating,comment,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    const rows = (data ?? []) as RatingRow[];
    setRatings(rows);

    const ids = Array.from(new Set(rows.map((r) => r.user_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id,display_name,avatar_url")
        .in("user_id", ids);
      const map: Record<string, ProfileLite> = {};
      (profs ?? []).forEach((p: any) => { map[p.user_id] = p; });
      setProfiles(map);
    }

    if (user) {
      const mine = rows.find((r) => r.user_id === user.id) ?? null;
      setMyRating(mine);
      if (mine) {
        setStars(mine.rating);
        setComment(mine.comment ?? "");
      }
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  const avg = useMemo(() => {
    if (!ratings.length) return 0;
    return ratings.reduce((s, r) => s + r.rating, 0) / ratings.length;
  }, [ratings]);

  const submit = async () => {
    if (!user) {
      toast.error("Prijavi se da bi ostavio ocenu");
      return;
    }
    if (stars < 1) {
      toast.error("Izaberi broj zvezdica");
      return;
    }
    setSubmitting(true);
    const payload = {
      user_id: user.id,
      rating: stars,
      comment: comment.trim().slice(0, 500) || null,
    };
    const { error } = await supabase
      .from("site_ratings")
      .upsert(payload, { onConflict: "user_id" });
    setSubmitting(false);
    if (error) {
      toast.error("Greška pri slanju ocene");
      return;
    }
    toast.success(myRating ? "Ocena ažurirana" : "Hvala na oceni!");
    await load();
  };

  return (
    <section className="container mx-auto px-4 py-12 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" /> Oceni MasterChess
            </h2>
            <p className="text-sm text-muted-foreground">
              {ratings.length > 0
                ? `${avg.toFixed(1)} / 5 · ${ratings.length} ${ratings.length === 1 ? "ocena" : "ocena"}`
                : "Budi prvi koji će oceniti sajt"}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-border/60 bg-background/40 p-4 mb-6">
          <div
            className="flex items-center gap-1 mb-3"
            onMouseLeave={() => setHover(0)}
          >
            {[1, 2, 3, 4, 5].map((n) => {
              const active = (hover || stars) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStars(n)}
                  onMouseEnter={() => setHover(n)}
                  aria-label={`${n} zvezdica`}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${active ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}`}
                  />
                </button>
              );
            })}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            placeholder="Napiši komentar (opciono, do 500 karaktera)"
            rows={3}
            className="mb-3"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">{comment.length}/500</span>
            {user ? (
              <Button onClick={submit} disabled={submitting || stars < 1}>
                {submitting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                {myRating ? "Ažuriraj ocenu" : "Pošalji ocenu"}
              </Button>
            ) : (
              <Button asChild>
                <Link to="/login">Prijavi se da oceniš</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Public reviews list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Najnovije ocene zajednice
            </h3>
            {ratings.length > 0 && (
              <span className="text-xs text-muted-foreground">{ratings.length} ukupno</span>
            )}
          </div>
          {loading ? (
            <div className="text-sm text-muted-foreground">Učitavanje…</div>
          ) : ratings.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">Još nema ocena. Budi prvi!</div>
          ) : (
            ratings.slice(0, 20).map((r) => {
              const p = profiles[r.user_id];
              const name = p?.display_name?.trim() || "Anonimni igrač";
              const initial = name.charAt(0).toUpperCase();
              const date = new Date(r.created_at).toLocaleDateString("sr-RS", {
                day: "numeric", month: "short", year: "numeric",
              });
              return (
                <div key={r.id} className="rounded-lg border border-border/50 bg-background/30 p-3">
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {p?.avatar_url ? (
                        <img src={p.avatar_url} alt={name} className="w-7 h-7 rounded-full object-cover border border-border/60" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                          {initial}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{name}</div>
                        <div className="text-[10px] text-muted-foreground">{date}</div>
                      </div>
                    </div>
                    <div className="flex shrink-0">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`w-3.5 h-3.5 ${r.rating >= n ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-foreground/85 whitespace-pre-wrap">{r.comment}</p>}
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </section>
  );
}
