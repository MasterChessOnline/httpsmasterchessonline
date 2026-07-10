import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

type Row = {
  id: string;
  name: string;
  external_results_url: string | null;
  chess_results_status: string | null;
  starts_at: string;
};

export default function AdminChessResults() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    (async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(Boolean(data));
    })();
  }, [user]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    (async () => {
      const { data } = await supabase
        .from("tournaments")
        .select("id,name,external_results_url,chess_results_status,starts_at")
        .order("starts_at", { ascending: false })
        .limit(50);
      setRows((data ?? []) as any);
    })();
  }, [user, isAdmin]);

  if (!user) return <Navigate to="/login" replace />;
  if (isAdmin === null) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  const save = async (row: Row, url: string) => {
    setBusy(row.id);
    const cleanUrl = url.trim() || null;
    const status = cleanUrl ? "listed" : "not_submitted";
    const wasListed = row.chess_results_status === "listed";
    const { error } = await supabase
      .from("tournaments")
      .update({
        external_results_url: cleanUrl,
        chess_results_status: status,
        chess_results_submitted_at: cleanUrl ? new Date().toISOString() : null,
      } as any)
      .eq("id", row.id);
    setBusy(null);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    setRows((r) =>
      r.map((x) =>
        x.id === row.id ? { ...x, external_results_url: cleanUrl, chess_results_status: status } : x,
      ),
    );
    toast({
      title: "Saved",
      description: status === "listed"
        ? "Marked as listed on Chess-Results."
        : "Reset to not submitted.",
    });

    // Ping IndexNow so Google picks up the change quickly
    try {
      await supabase.functions.invoke("indexnow-ping", { body: { urls: ["/dragan-brakus"] } });
    } catch { /* silent */ }

    // Auto-publish a news article the first time we mark it listed
    if (cleanUrl && !wasListed) {
      try {
        const slug = `${row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-listed-on-chess-results-${new Date().getFullYear()}`;
        await supabase.from("news_posts").insert({
          title: `${row.name} officially listed on Chess-Results Serbia`,
          slug,
          url: cleanUrl,
          body_md: `**${row.name}** is now officially listed on [Chess-Results Serbia](${cleanUrl}). Live standings, pairings, and final cross-tables will be published there round by round.\n\nRegister and follow the event on [MasterChess](/dragan-brakus).`,
          kind: "article",
          source: "MasterChess.live Newsroom",
          author_name: "MasterChess.live Newsroom",
          featured: true,
          score: 100,
        } as any);
        toast({ title: "News post published", description: "An announcement article was added to /news." });
      } catch (e: any) {
        // duplicate slug etc. — non-fatal
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo title="Admin · Chess-Results" description="Manage Chess-Results listing status." path="/admin/chess-results" />
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Chess-Results status</h1>
        <p className="text-muted-foreground mb-6">
          Paste the Chess-Results URL once the tournament is live there. Public pages flip from
          "Pending submission" to "Listed", a news post auto-publishes, and IndexNow re-pings Google.
        </p>

        <div className="space-y-4">
          {rows.map((t) => (
            <RowEditor key={t.id} row={t} busy={busy === t.id} onSave={save} />
          ))}
          {rows.length === 0 && (
            <p className="text-muted-foreground">No tournaments found.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function RowEditor({ row, busy, onSave }: { row: Row; busy: boolean; onSave: (row: Row, url: string) => void }) {
  const [url, setUrl] = useState(row.external_results_url ?? "");
  const listed = row.chess_results_status === "listed";
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold">{row.name}</h3>
          <p className="text-xs text-muted-foreground">{new Date(row.starts_at).toLocaleString()}</p>
        </div>
        <Badge variant={listed ? "default" : "outline"}>
          {listed ? "Listed on Chess-Results" : "Pending submission"}
        </Badge>
      </div>
      <div className="flex gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://chess-results.com/tnr...aspx?lan=1"
          className="flex-1"
        />
        <Button onClick={() => onSave(row, url)} disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </Button>
      </div>
    </Card>
  );
}
