// Official recognitions shown on a player's public profile
// (e.g. "MasterChess Coach", signed by the person who granted it).
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { GraduationCap, Award, ShieldCheck } from "lucide-react";

type UserAward = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  issuer: string;
  badge: string;
  awarded_at: string;
};

const ICONS: Record<string, any> = { coach: GraduationCap, verified: ShieldCheck, award: Award };

export default function AwardsPanel({ userId }: { userId: string }) {
  const [awards, setAwards] = useState<UserAward[]>([]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_awards")
        .select("id,title,subtitle,description,issuer,badge,awarded_at")
        .eq("user_id", userId)
        .order("awarded_at", { ascending: false });
      if (!cancelled) setAwards((data as UserAward[]) || []);
    })();
    return () => { cancelled = true; };
  }, [userId]);

  if (awards.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-semibold text-foreground">Official Recognition</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {awards.map((a) => {
          const Icon = ICONS[a.badge] || Award;
          return (
            <Card
              key={a.id}
              className="border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-4"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-bold leading-tight text-foreground">{a.title}</div>
                  {a.subtitle && (
                    <div className="text-[11px] uppercase tracking-wider text-primary">{a.subtitle}</div>
                  )}
                </div>
              </div>
              {a.description && (
                <p className="mt-3 text-sm text-muted-foreground">{a.description}</p>
              )}
              <div className="mt-3 border-t border-border pt-2 text-xs text-muted-foreground">
                Awarded by <span className="font-semibold text-foreground">{a.issuer}</span> ·{" "}
                {new Date(a.awarded_at).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
