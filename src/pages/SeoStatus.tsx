import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, AlertTriangle, RefreshCw, ShieldAlert, Search, ExternalLink, Zap, Video, Globe } from "lucide-react";
import { toast } from "sonner";

type Sitemap = {
  path: string;
  lastSubmitted?: string;
  lastDownloaded?: string;
  isPending?: boolean;
  isSitemapsIndex?: boolean;
  warnings?: string;
  errors?: string;
  contents?: { type: string; submitted?: string; indexed?: string }[];
};

type Row = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number };

type StatusResponse = {
  site: string;
  period: { startDate: string; endDate: string };
  sitemaps: Sitemap[];
  totals: Row | null;
  topQueries: Row[];
  topPages: Row[];
  checked_at: string;
};

export default function SeoStatus() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [data, setData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [indexingResult, setIndexingResult] = useState<{
    succeeded: number; failed: number; total: number; scopeIssue?: boolean; hint?: string;
  } | null>(null);
  const [indexNowPinging, setIndexNowPinging] = useState(false);

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
      const { data, error } = await supabase.functions.invoke("gsc-status");
      if (error) throw error;
      setData(data as StatusResponse);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load SEO status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  const resubmit = async () => {
    setResubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("gsc-status?action=resubmit");
      if (error) throw error;
      toast.success("Sitemap resubmitted to Google");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Resubmit failed");
    } finally {
      setResubmitting(false);
    }
  };

  const pushToGoogle = async () => {
    setPinging(true);
    setIndexingResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("google-indexing-ping", {
        body: { type: "URL_UPDATED" },
      });
      if (error) throw error;
      setIndexingResult(data);
      if (data?.succeeded > 0) {
        toast.success(`${data.succeeded}/${data.total} URLs pushed to Google`);
      } else {
        toast.error("Indexing API push failed — see details below");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Indexing push failed");
    } finally {
      setPinging(false);
    }
  };

  const pingIndexNow = async () => {
    setIndexNowPinging(true);
    try {
      const { data, error } = await supabase.functions.invoke("indexnow-ping", { body: {} });
      if (error) throw error;
      toast.success(`IndexNow: pinged ${data?.pinged ?? 0} URLs (Bing/Yandex)`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "IndexNow ping failed");
    } finally {
      setIndexNowPinging(false);
    }
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-5xl px-4 pt-28 pb-16 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-2xl px-4 pt-28 pb-16">
          <Alert variant="destructive">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle>Admin access required</AlertTitle>
            <AlertDescription>This page is restricted to MasterChess admins.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-5xl px-4 pt-28 pb-16 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Search className="h-7 w-7 text-primary" /> SEO Status
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Live data from Google Search Console for masterchess.live
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button variant="outline" onClick={resubmit} disabled={resubmitting}>
              {resubmitting ? "Submitting..." : "Resubmit sitemap"}
            </Button>
            <Button onClick={pushToGoogle} disabled={pinging} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
              <Zap className={`h-4 w-4 mr-2 ${pinging ? "animate-pulse" : ""}`} />
              {pinging ? "Pushing…" : "Push to Google (Indexing API)"}
            </Button>
            <Button variant="secondary" onClick={pingIndexNow} disabled={indexNowPinging}>
              <Globe className={`h-4 w-4 mr-2 ${indexNowPinging ? "animate-spin" : ""}`} />
              {indexNowPinging ? "Pinging…" : "Ping Bing/Yandex (IndexNow)"}
            </Button>
          </div>
        </div>

        {/* Indexing API result */}
        {indexingResult && (
          <Alert variant={indexingResult.scopeIssue ? "destructive" : "default"}>
            <Zap className="h-5 w-5" />
            <AlertTitle>
              Indexing API: {indexingResult.succeeded}/{indexingResult.total} URLs accepted by Google
            </AlertTitle>
            <AlertDescription>
              {indexingResult.scopeIssue
                ? indexingResult.hint
                : indexingResult.failed === 0
                  ? "All URLs forwarded to Googlebot for instant crawl. New pages typically appear in SERP within 1-24h."
                  : `${indexingResult.failed} URLs failed — check function logs for details.`}
            </AlertDescription>
          </Alert>
        )}

        {/* Video sitemap quick links */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" /> Video Sitemap (DailyChess_12)
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Auto-generated from YouTube — Google Video Search indexes thumbnails.
              </p>
            </div>
            <a
              href="https://kicabdwgdyabibioycbq.supabase.co/functions/v1/generate-video-sitemap"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View XML <ExternalLink className="h-3 w-3" />
            </a>
          </CardHeader>
        </Card>


        {/* Totals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Clicks (28d)", value: data?.totals?.clicks ?? 0 },
            { label: "Impressions (28d)", value: data?.totals?.impressions ?? 0 },
            { label: "CTR", value: data?.totals ? `${(data.totals.ctr * 100).toFixed(2)}%` : "—" },
            { label: "Avg position", value: data?.totals ? data.totals.position.toFixed(1) : "—" },
          ].map((m) => (
            <Card key={m.label}>
              <CardContent className="pt-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{m.label}</div>
                <div className="text-2xl font-bold mt-1">{m.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sitemaps */}
        <Card>
          <CardHeader>
            <CardTitle>Sitemaps</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.sitemaps?.length ? (
              <div className="space-y-3">
                {data.sitemaps.map((s) => {
                  const hasErrors = Number(s.errors ?? 0) > 0;
                  const hasWarnings = Number(s.warnings ?? 0) > 0;
                  const submitted = s.contents?.[0]?.submitted ?? "—";
                  const indexed = s.contents?.[0]?.indexed ?? "—";
                  return (
                    <div key={s.path} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <a href={s.path} target="_blank" rel="noopener noreferrer"
                           className="font-mono text-sm hover:underline flex items-center gap-1">
                          {s.path} <ExternalLink className="h-3 w-3" />
                        </a>
                        {hasErrors ? (
                          <Badge variant="destructive">{s.errors} errors</Badge>
                        ) : hasWarnings ? (
                          <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/40">
                            {s.warnings} warnings
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/40">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> OK
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div><div className="text-muted-foreground text-xs">Submitted URLs</div><div>{submitted}</div></div>
                        <div><div className="text-muted-foreground text-xs">Indexed URLs</div><div>{indexed}</div></div>
                        <div><div className="text-muted-foreground text-xs">Last submitted</div>
                          <div>{s.lastSubmitted ? new Date(s.lastSubmitted).toLocaleDateString() : "—"}</div></div>
                        <div><div className="text-muted-foreground text-xs">Last downloaded</div>
                          <div>{s.lastDownloaded ? new Date(s.lastDownloaded).toLocaleDateString() : "—"}</div></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>No sitemaps registered yet. Click "Resubmit sitemap" to submit it.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Top queries */}
        <Card>
          <CardHeader><CardTitle>Top search queries (28d)</CardTitle></CardHeader>
          <CardContent>
            {data?.topQueries?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground border-b">
                    <tr><th className="text-left py-2">Query</th><th className="text-right">Clicks</th>
                      <th className="text-right">Impr.</th><th className="text-right">CTR</th>
                      <th className="text-right">Pos.</th></tr>
                  </thead>
                  <tbody>
                    {data.topQueries.map((r, i) => (
                      <tr key={i} className="border-b border-border/40">
                        <td className="py-2">{r.keys?.[0]}</td>
                        <td className="text-right">{r.clicks}</td>
                        <td className="text-right">{r.impressions}</td>
                        <td className="text-right">{(r.ctr * 100).toFixed(1)}%</td>
                        <td className="text-right">{r.position.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No query data yet — Google needs a few days to start collecting impressions.</p>
            )}
          </CardContent>
        </Card>

        {/* Top pages */}
        <Card>
          <CardHeader><CardTitle>Top pages (28d)</CardTitle></CardHeader>
          <CardContent>
            {data?.topPages?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground border-b">
                    <tr><th className="text-left py-2">Page</th><th className="text-right">Clicks</th>
                      <th className="text-right">Impr.</th><th className="text-right">CTR</th>
                      <th className="text-right">Pos.</th></tr>
                  </thead>
                  <tbody>
                    {data.topPages.map((r, i) => (
                      <tr key={i} className="border-b border-border/40">
                        <td className="py-2 font-mono text-xs truncate max-w-[280px]">{r.keys?.[0]}</td>
                        <td className="text-right">{r.clicks}</td>
                        <td className="text-right">{r.impressions}</td>
                        <td className="text-right">{(r.ctr * 100).toFixed(1)}%</td>
                        <td className="text-right">{r.position.toFixed(1)}</td>
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

        {data && (
          <p className="text-xs text-muted-foreground text-center">
            Last checked: {new Date(data.checked_at).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
