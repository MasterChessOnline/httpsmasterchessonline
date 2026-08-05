// Admin-only Google Search Console dashboard.
// Pulls clicks/impressions/CTR/position from the GSC connector and shows
// top queries, top pages, and week-over-week deltas.
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, TrendingUp, TrendingDown, Search, Zap } from "lucide-react";

interface GscRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}
interface GscReport {
  ok?: boolean;
  error?: string;
  period?: { start: string; end: string };
  weekOverWeek?: {
    this_week: { clicks: number; impressions: number };
    last_week: { clicks: number; impressions: number };
    clicks_delta_pct: number;
  };
  top_queries?: GscRow[];
  top_pages?: GscRow[];
}

interface OppReport {
  error?: string;
  period?: { start: string; end: string };
  striking_distance?: {
    query: string; page: string; impressions: number; clicks: number; ctr: number; position: number;
  }[];
  low_ctr_pages?: {
    page: string; impressions: number; clicks: number; ctr: number; position: number;
  }[];
  sitemap_health?: {
    path: string; errors: number; warnings: number; submitted: number; indexed: number; isPending: boolean;
  }[];
}

export default function AdminGsc() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [data, setData] = useState<GscReport | null>(null);
  const [opps, setOpps] = useState<OppReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [oppLoading, setOppLoading] = useState(false);
  const [pinging, setPinging] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data }) => setIsAdmin(Boolean(data)));
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("gsc-search-analytics");
      if (error) throw error;
      setData(data as GscReport);
    } catch (e: any) {
      toast.error(e?.message ?? "GSC load failed");
    } finally {
      setLoading(false);
    }
  };

  const loadOpps = async () => {
    setOppLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("gsc-opportunities");
      if (error) throw error;
      setOpps(data as OppReport);
    } catch (e: any) {
      toast.error(e?.message ?? "Opportunity report failed");
    } finally {
      setOppLoading(false);
    }
  };

  const pingIndexNow = async () => {
    setPinging(true);
    try {
      const { data, error } = await supabase.functions.invoke("indexnow-submit", {
        body: {},
      });
      if (error) throw error;
      toast.success(`IndexNow: ${(data as any)?.total_urls ?? 0} URLs submitted`);
    } catch (e: any) {
      toast.error(e?.message ?? "IndexNow failed");
    } finally {
      setPinging(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      load();
      loadOpps();
    }
  }, [isAdmin]);

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Admin only</h1>
          <p className="text-muted-foreground mt-2">You need admin access to view this page.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const wow = data?.weekOverWeek;
  const delta = wow?.clicks_delta_pct ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Search Console Dashboard · Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Search className="w-7 h-7 text-amber-400" /> Search Console
            </h1>
            <p className="text-sm text-muted-foreground">
              {data?.period
                ? `${data.period.start} → ${data.period.end}`
                : "Last 28 days from Google Search Console"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={pingIndexNow} disabled={pinging} variant="outline">
              <Zap className="w-4 h-4 mr-2" /> {pinging ? "Pinging…" : "IndexNow ping"}
            </Button>
            <Button onClick={load} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>

        {data?.error && (
          <Card className="p-4 mb-6 border-red-500/50 bg-red-500/10">
            <p className="text-sm text-red-400">{data.error}</p>
          </Card>
        )}

        {wow && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <p className="text-xs uppercase text-muted-foreground">Clicks this week</p>
              <p className="text-2xl font-bold">{wow.this_week.clicks.toLocaleString()}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs uppercase text-muted-foreground">Impressions this week</p>
              <p className="text-2xl font-bold">{wow.this_week.impressions.toLocaleString()}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs uppercase text-muted-foreground">Clicks last week</p>
              <p className="text-2xl font-bold text-muted-foreground">
                {wow.last_week.clicks.toLocaleString()}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs uppercase text-muted-foreground">WoW Δ</p>
              <p
                className={`text-2xl font-bold flex items-center gap-1 ${
                  delta >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {delta >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {delta.toFixed(1)}%
              </p>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-4">
            <h2 className="font-bold mb-3">Top queries (28d)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="pb-2">Query</th>
                    <th className="pb-2 text-right">Clicks</th>
                    <th className="pb-2 text-right">Impr.</th>
                    <th className="pb-2 text-right">CTR</th>
                    <th className="pb-2 text-right">Pos.</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.top_queries ?? []).map((r, i) => (
                    <tr key={i} className="border-t border-border/30">
                      <td className="py-1.5 truncate max-w-[180px]">{r.keys?.[0]}</td>
                      <td className="py-1.5 text-right font-mono">{r.clicks ?? 0}</td>
                      <td className="py-1.5 text-right font-mono text-muted-foreground">
                        {r.impressions ?? 0}
                      </td>
                      <td className="py-1.5 text-right font-mono">
                        {((r.ctr ?? 0) * 100).toFixed(1)}%
                      </td>
                      <td className="py-1.5 text-right font-mono">
                        {(r.position ?? 0).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                  {!data?.top_queries?.length && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted-foreground py-6">
                        {loading ? "Loading…" : "No data yet"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="font-bold mb-3">Top pages (28d)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="pb-2">Page</th>
                    <th className="pb-2 text-right">Clicks</th>
                    <th className="pb-2 text-right">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.top_pages ?? []).map((r, i) => {
                    const u = r.keys?.[0] ?? "";
                    const path = u.replace(/^https?:\/\/[^/]+/, "") || "/";
                    return (
                      <tr key={i} className="border-t border-border/30">
                        <td className="py-1.5 truncate max-w-[260px]">
                          <a className="hover:underline" href={u} target="_blank" rel="noopener noreferrer">
                            {path}
                          </a>
                        </td>
                        <td className="py-1.5 text-right font-mono">{r.clicks ?? 0}</td>
                        <td className="py-1.5 text-right font-mono">
                          {((r.ctr ?? 0) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                  {!data?.top_pages?.length && (
                    <tr>
                      <td colSpan={3} className="text-center text-muted-foreground py-6">
                        {loading ? "Loading…" : "No data yet"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="flex items-center justify-between mt-10 mb-4 flex-wrap gap-3">
          <h2 className="text-2xl font-bold">Opportunities</h2>
          <Button onClick={loadOpps} disabled={oppLoading} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${oppLoading ? "animate-spin" : ""}`} />
            {oppLoading ? "Mining…" : "Re-run report"}
          </Button>
        </div>

        {opps?.error && (
          <Card className="p-4 mb-6 border-red-500/50 bg-red-500/10">
            <p className="text-sm text-red-400">{opps.error}</p>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-4">
            <h3 className="font-bold mb-1">Striking distance (pos. 5–20)</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Queries already close to page one. Strengthening these pages is the fastest win.
            </p>
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="pb-2">Query → page</th>
                    <th className="pb-2 text-right">Impr.</th>
                    <th className="pb-2 text-right">Pos.</th>
                  </tr>
                </thead>
                <tbody>
                  {(opps?.striking_distance ?? []).map((r, i) => (
                    <tr key={i} className="border-t border-border/30">
                      <td className="py-1.5 max-w-[260px]">
                        <span className="block truncate">{r.query}</span>
                        <span className="block truncate text-xs text-muted-foreground">{r.page}</span>
                      </td>
                      <td className="py-1.5 text-right font-mono">{r.impressions}</td>
                      <td className="py-1.5 text-right font-mono text-amber-400">
                        {r.position.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                  {!opps?.striking_distance?.length && (
                    <tr>
                      <td colSpan={3} className="text-center text-muted-foreground py-6">
                        {oppLoading ? "Loading…" : "No reported data"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-bold mb-1">Low-CTR pages (CTR &lt; 2%)</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Seen a lot but rarely clicked — rewrite the title and description first.
            </p>
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="pb-2">Page</th>
                    <th className="pb-2 text-right">Impr.</th>
                    <th className="pb-2 text-right">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {(opps?.low_ctr_pages ?? []).map((r, i) => (
                    <tr key={i} className="border-t border-border/30">
                      <td className="py-1.5 truncate max-w-[260px]">{r.page}</td>
                      <td className="py-1.5 text-right font-mono">{r.impressions}</td>
                      <td className="py-1.5 text-right font-mono text-red-400">
                        {(r.ctr * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                  {!opps?.low_ctr_pages?.length && (
                    <tr>
                      <td colSpan={3} className="text-center text-muted-foreground py-6">
                        {oppLoading ? "Loading…" : "No reported data"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <Card className="p-4 mt-6">
          <h3 className="font-bold mb-1">Sitemap health</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Error and warning values are counts reported by Google, not causes.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="pb-2">Sitemap</th>
                  <th className="pb-2 text-right">Submitted</th>
                  <th className="pb-2 text-right">Indexed</th>
                  <th className="pb-2 text-right">Errors</th>
                  <th className="pb-2 text-right">Warnings</th>
                </tr>
              </thead>
              <tbody>
                {(opps?.sitemap_health ?? []).map((s, i) => (
                  <tr key={i} className="border-t border-border/30">
                    <td className="py-1.5 truncate max-w-[280px]">
                      {s.path} {s.isPending && <Badge variant="outline" className="ml-2">pending</Badge>}
                    </td>
                    <td className="py-1.5 text-right font-mono">{s.submitted}</td>
                    <td className="py-1.5 text-right font-mono">{s.indexed}</td>
                    <td className={`py-1.5 text-right font-mono ${s.errors ? "text-red-400" : ""}`}>
                      {s.errors}
                    </td>
                    <td className={`py-1.5 text-right font-mono ${s.warnings ? "text-amber-400" : ""}`}>
                      {s.warnings}
                    </td>
                  </tr>
                ))}
                {!opps?.sitemap_health?.length && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted-foreground py-6">
                      {oppLoading ? "Loading…" : "No reported data"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-4 mt-6">
          <h2 className="font-bold mb-2">About IndexNow</h2>
          <p className="text-sm text-muted-foreground">
            One click pushes every sitemap URL to Bing, Yandex, Seznam and Naver instantly.
            Google does not accept IndexNow, but the same change usually triggers Googlebot
            recrawl within 24h because the sitemap was re-checked.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            <Badge variant="outline">Automated</Badge> Daily cron runs at 04:00 UTC.
          </p>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
