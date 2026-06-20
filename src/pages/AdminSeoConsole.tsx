// Admin-only dashboard: trigger GSC submissions and review query opportunities.
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminSeoConsole() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!user) { setIsAdmin(false); return; }
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
      if (data) {
        const { data: opps } = await supabase.from("seo_query_opportunities")
          .select("*").order("impressions", { ascending: false }).limit(100);
        setRows(opps ?? []);
      }
    })();
  }, [user]);

  const run = async (fn: string) => {
    setBusy(fn);
    const { error, data } = await supabase.functions.invoke(fn, { body: {} });
    if (error) toast.error(`${fn} failed`); else toast.success(`${fn}: ${JSON.stringify(data).slice(0, 80)}`);
    setBusy(null);
  };

  if (isAdmin === null) return null;
  if (!isAdmin) return (
    <div className="min-h-screen bg-background"><Navbar /><main className="container mx-auto py-16 text-center text-muted-foreground">Admin only.</main><Footer /></div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet><title>SEO Console (Admin)</title><meta name="robots" content="noindex" /></Helmet>
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-10 space-y-6">
        <h1 className="text-3xl font-bold">SEO Console</h1>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => run("submit-sitemaps-gsc")} disabled={busy === "submit-sitemaps-gsc"}>Resubmit sitemaps</Button>
          <Button onClick={() => run("fetch-gsc-queries")} disabled={busy === "fetch-gsc-queries"}>Pull GSC queries</Button>
        </div>
        <Card className="p-4">
          <h2 className="font-semibold mb-3">Query opportunities ({rows.length})</h2>
          <div className="text-xs grid grid-cols-5 gap-2 font-mono">
            <div className="font-semibold">Query</div><div>Impr.</div><div>Clicks</div><div>CTR</div><div>Pos</div>
            {rows.map(r => (
              <>
                <div key={r.id} className="truncate">{r.query}</div>
                <div>{r.impressions}</div>
                <div>{r.clicks}</div>
                <div>{(r.ctr * 100).toFixed(2)}%</div>
                <div>{Number(r.avg_position).toFixed(1)}</div>
              </>
            ))}
          </div>
          {!rows.length && <p className="text-sm text-muted-foreground">No opportunities yet. Click "Pull GSC queries".</p>}
        </Card>
      </main>
      <Footer />
    </div>
  );
}
