// Combined SEO + traffic + activity dashboard. Admin-only.
// Pulls: GSC (clicks/impressions/queries/pages), site-wide totals from Supabase
// (users, games, openings indexed), and exposes "Re-ping IndexNow" button.
import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, RefreshCw, Search, Send, Users, Gamepad2, Eye, MousePointerClick, TrendingUp, Globe } from "lucide-react";
import { toast } from "sonner";
import { ALL_OPENING_SLUGS } from "@/lib/opening-seo-meta";

type GscRow = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number };
type GscData = {
  totals: GscRow | null;
  topQueries: GscRow[];
  topPages: GscRow[];
  sitemaps: { path: string; contents?: { submitted?: string; indexed?: string }[] }[];
};
type SiteTotals = { users: number; games: number; tournaments: number; openings: number };

export default function AdminFullStats() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [gsc, setGsc] = useState<GscData | null>(null);
  const [totals, setTotals] = useState<SiteTotals | null>(null);
  const [loading, setLoading] = useState(false);
  const [pinging, setPinging] = useState(false);
  const ga4Enabled = Boolean(import.meta.env.VITE_GA4_ID);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    (async () => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(error ? false : Boolean(data));
    })();
  }, [user, authLoading, navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [gscRes, usersRes, gamesRes, toursRes] = await Promise.all([
        supabase.functions.invoke("gsc-status"),
        supabase.from("profiles").select("user_id", { count: "exact", head: true }),
        supabase.from("online_games").select("id", { count: "exact", head: true }),
        supabase.from("tournaments").select("id", { count: "exact", head: true }),
      ]);
      if (gscRes.data) setGsc(gscRes.data as GscData);
      setTotals({
        users: usersRes.count ?? 0,
        games: gamesRes.count ?? 0,
        tournaments: toursRes.count ?? 0,
        openings: ALL_OPENING_SLUGS.length,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  const ping = async () => {
    setPinging(true);
    try {
      const { data, error } = await supabase.functions.invoke("indexnow-ping", { body: {} });
      if (error) throw error;
      toast.success(`Pinged ${(data as any)?.pinged ?? 0} URLs to Bing/Yandex/Seznam`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ping failed");
    } finally {
      setPinging(false);
    }
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-6xl px-4 pt-28 pb-16 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
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
            <AlertTitle>Admin only</AlertTitle>
            <AlertDescription>Restricted to MasterChess admins.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const submitted = gsc?.sitemaps?.reduce((acc, s) => acc + Number(s.contents?.[0]?.submitted ?? 0), 0) ?? 0;
  const indexed = gsc?.sitemaps?.reduce((acc, s) => acc + Number(s.contents?.[0]?.indexed ?? 0), 0) ?? 0;
  const indexRate = submitted > 0 ? Math.round((indexed / submitted) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-6xl px-4 pt-28 pb-16 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="h-7 w-7 text-primary" /> Full Stats Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              SEO + traffic + activity for masterchess.live
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button onClick={ping} disabled={pinging}>
              <Send className={`h-4 w-4 mr-2 ${pinging ? "animate-pulse" : ""}`} />
              {pinging ? "Pinging..." : "Re-ping IndexNow"}
            </Button>
          </div>
        </div>

        {/* Hero KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Google Clicks (28d)", value: gsc?.totals?.clicks ?? 0, icon: MousePointerClick },
            { label: "Google Impressions (28d)", value: gsc?.totals?.impressions ?? 0, icon: Eye },
            { label: "Avg Position", value: gsc?.totals ? gsc.totals.position.toFixed(1) : "—", icon: Search },
            { label: "Index Rate", value: `${indexRate}%`, icon: Globe },
          ].map((m) => (
            <Card key={m.label} className="border-primary/20">
              <CardContent className="pt-6">
                <m.icon className="h-5 w-5 text-primary mb-2" />
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{m.label}</div>
                <div className="text-2xl font-bold mt-1">{m.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Site totals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Registered Players", value: totals?.users ?? 0, icon: Users },
            { label: "Games Played", value: totals?.games ?? 0, icon: Gamepad2 },
            { label: "Tournaments", value: totals?.tournaments ?? 0, icon: TrendingUp },
            { label: "Indexed Openings", value: totals?.openings ?? 0, icon: Globe },
          ].map((m) => (
            <Card key={m.label}>
              <CardContent className="pt-6">
                <m.icon className="h-5 w-5 text-muted-foreground mb-2" />
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{m.label}</div>
                <div className="text-2xl font-bold mt-1">{m.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* GA4 status */}
        <Alert className={ga4Enabled ? "border-emerald-500/40" : "border-amber-500/40"}>
          <AlertTitle className="flex items-center gap-2">
            {ga4Enabled ? "✅ Google Analytics 4 active" : "⚠️ GA4 not configured"}
          </AlertTitle>
          <AlertDescription>
            {ga4Enabled
              ? "Visitor analytics are being tracked. View detailed reports at analytics.google.com."
              : "Add VITE_GA4_ID env variable (format: G-XXXXXXXXXX) from analytics.google.com to enable real-time visitor tracking, traffic sources, session duration, and more."}
          </AlertDescription>
        </Alert>

        {/* Top queries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Search Queries (28d)</CardTitle>
          </CardHeader>
          <CardContent>
            {gsc?.topQueries?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground border-b">
                    <tr>
                      <th className="text-left py-2">Query</th>
                      <th className="text-right">Clicks</th>
                      <th className="text-right">Impressions</th>
                      <th className="text-right">CTR</th>
                      <th className="text-right">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gsc.topQueries.map((r, i) => (
                      <tr key={i} className="border-b border-border/40">
                        <td className="py-2">{r.keys?.[0]}</td>
                        <td className="text-right font-semibold">{r.clicks}</td>
                        <td className="text-right">{r.impressions}</td>
                        <td className="text-right">{(r.ctr * 100).toFixed(1)}%</td>
                        <td className="text-right">
                          <Badge variant={r.position <= 10 ? "default" : "secondary"}>
                            {r.position.toFixed(1)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No data yet — Google needs 1-7 days to start collecting impressions for new sitemaps.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages (28d)</CardTitle>
          </CardHeader>
          <CardContent>
            {gsc?.topPages?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground border-b">
                    <tr>
                      <th className="text-left py-2">Page</th>
                      <th className="text-right">Clicks</th>
                      <th className="text-right">Impressions</th>
                      <th className="text-right">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gsc.topPages.map((r, i) => (
                      <tr key={i} className="border-b border-border/40">
                        <td className="py-2 font-mono text-xs truncate max-w-[400px]">{r.keys?.[0]}</td>
                        <td className="text-right font-semibold">{r.clicks}</td>
                        <td className="text-right">{r.impressions}</td>
                        <td className="text-right">{(r.ctr * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No page data yet.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2 flex-wrap">
          <Link to="/admin/seo-status"><Button variant="outline">Detailed SEO Status</Button></Link>
          <Link to="/admin/email-status"><Button variant="outline">Email Status</Button></Link>
        </div>
      </div>
    </div>
  );
}
