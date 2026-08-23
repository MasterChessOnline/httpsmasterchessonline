// ADMIN HEALTH — plan sections 23, 24, 25, 54, 55, 56.
//
// One page that answers the only questions that matter:
//   Is the site fast? Is it breaking? How many people played a game?
//   How many played a second one? How many came back?
// Plus the feature-flag switchboard so any big feature can be turned off.

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Gauge, RefreshCw, ShieldAlert, ToggleLeft, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

type Vital = { metric: string; samples: number; p50: number; p75: number };
type FunnelRow = { event: string; sessions: number; total: number };
type ErrorRow = {
  id: string;
  created_at: string;
  kind: string;
  message: string;
  route: string | null;
  release: string | null;
};
type Flag = { key: string; enabled: boolean; rollout: number; description: string | null };

// Google's "good" thresholds, so a number is instantly readable.
const GOOD: Record<string, number> = { LCP: 2500, FCP: 1800, INP: 200, CLS: 0.1, TTFB: 800 };

const FUNNEL_ORDER = [
  "page_view",
  "signup_cta_click",
  "signup",
  "queue_join",
  "match_found",
  "game_start",
  "first_game",
  "game_finished",
  "second_game",
  "rematch",
  "rematch_click",
  "bot_fallback_start",
  "reminder_optin",
  "day_1_return",
];

function fmt(metric: string, value: number): string {
  if (metric === "CLS") return value.toFixed(3);
  return `${Math.round(value)} ms`;
}

export default function AdminHealth() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [days, setDays] = useState(7);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [funnel, setFunnel] = useState<FunnelRow[]>([]);
  const [errors, setErrors] = useState<ErrorRow[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    (async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      setIsAdmin(error ? false : Boolean(data));
    })();
  }, [user, authLoading, navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [v, f, e, fl] = await Promise.all([
        supabase.rpc("get_vitals_summary", { _days: days }),
        supabase.rpc("get_funnel_summary", { _days: days }),
        supabase
          .from("client_errors")
          .select("id, created_at, kind, message, route, release")
          .order("created_at", { ascending: false })
          .limit(40),
        supabase.from("feature_flags").select("key, enabled, rollout, description").order("key"),
      ]);
      setVitals((v.data as Vital[]) ?? []);
      setFunnel((f.data as FunnelRow[]) ?? []);
      setErrors((e.data as ErrorRow[]) ?? []);
      setFlags((fl.data as Flag[]) ?? []);
    } catch {
      toast.error("Could not load health data");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const saveFlag = async (key: string, patch: Partial<Flag>) => {
    setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, ...patch } : f)));
    const { error } = await supabase
      .from("feature_flags")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("key", key);
    if (error) {
      toast.error("Could not save flag");
      load();
    } else {
      toast.success(`${key} updated`);
    }
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-5xl px-4 pt-28 pb-16 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-2xl px-4 pt-28 pb-16">
          <Alert variant="destructive">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle>Admin access required</AlertTitle>
            <AlertDescription>
              This page shows operational data and is restricted to MasterChess admins.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const funnelMap = new Map(funnel.map((r) => [r.event, r]));
  const ordered = [
    ...FUNNEL_ORDER.filter((e) => funnelMap.has(e)).map((e) => funnelMap.get(e)!),
    ...funnel.filter((r) => !FUNNEL_ORDER.includes(r.event)),
  ];
  const top = ordered[0]?.sessions ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Site Health — MasterChess Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />
      <div className="container mx-auto max-w-5xl px-4 pt-28 pb-16 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Site Health</h1>
            <p className="text-muted-foreground text-sm">
              Speed, crashes, activation funnel and feature switches — measured, not guessed.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[1, 7, 30].map((d) => (
              <Button
                key={d}
                size="sm"
                variant={days === d ? "default" : "outline"}
                onClick={() => setDays(d)}
              >
                {d}d
              </Button>
            ))}
            <Button size="sm" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" /> Real-user speed (Core Web Vitals)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vitals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No samples yet in this window. Metrics arrive as visitors leave a page.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {vitals.map((v) => {
                  const good = GOOD[v.metric] ? v.p75 <= GOOD[v.metric] : true;
                  return (
                    <div key={v.metric} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{v.metric}</span>
                        <Badge variant={good ? "default" : "destructive"}>
                          {good ? "good" : "needs work"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-2xl font-bold">{fmt(v.metric, v.p75)}</p>
                      <p className="text-xs text-muted-foreground">
                        p75 · median {fmt(v.metric, v.p50)} · {v.samples} samples
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Activation funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordered.length === 0 ? (
              <p className="text-sm text-muted-foreground">No funnel events recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {ordered.map((row) => (
                  <div key={row.event} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{row.event}</span>
                      <span className="text-muted-foreground">
                        {row.sessions} sessions · {row.total} events
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${top ? Math.max(2, (row.sessions / top) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TriangleAlert className="h-5 w-5 text-destructive" /> Latest errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No client errors captured. </p>
            ) : (
              <div className="space-y-2">
                {errors.map((e) => (
                  <div key={e.id} className="rounded-lg border p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{e.kind}</Badge>
                      <span className="font-mono text-xs text-muted-foreground">
                        {e.route ?? "?"} · {e.release ?? "?"} ·{" "}
                        {new Date(e.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 break-words">{e.message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ToggleLeft className="h-5 w-5 text-primary" /> Feature flags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {flags.map((f) => (
              <div key={f.key} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{f.key}</p>
                    {f.description && (
                      <p className="text-xs text-muted-foreground">{f.description}</p>
                    )}
                  </div>
                  <Switch
                    checked={f.enabled}
                    onCheckedChange={(v) => saveFlag(f.key, { enabled: v })}
                  />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="w-20 text-xs text-muted-foreground">
                    rollout {f.rollout}%
                  </span>
                  <Slider
                    className="flex-1"
                    value={[f.rollout]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={([v]) =>
                      setFlags((prev) =>
                        prev.map((x) => (x.key === f.key ? { ...x, rollout: v } : x)),
                      )
                    }
                    onValueCommit={([v]) => saveFlag(f.key, { rollout: v })}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
