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
  slug: string;
  chess_results_url: string | null;
  chess_results_status: string | null;
  starts_at: string;
};

export default function AdminChessResults() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const isAdmin = (profile as any)?.is_admin === true;

  useEffect(() => {
    if (!user || !isAdmin) return;
    (async () => {
      const { data } = await supabase
        .from("tournaments")
        .select("id,name,slug,chess_results_url,chess_results_status,starts_at")
        .order("starts_at", { ascending: false })
        .limit(50);
      setRows((data ?? []) as any);
    })();
  }, [user, isAdmin]);

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const save = async (id: string, url: string) => {
    setBusy(id);
    const status = url.trim() ? "listed" : "not_submitted";
    const { error } = await supabase
      .from("tournaments")
      .update({ chess_results_url: url.trim() || null, chess_results_status: status } as any)
      .eq("id", id);
    setBusy(null);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    setRows((r) => r.map((x) => (x.id === id ? { ...x, chess_results_url: url.trim() || null, chess_results_status: status } : x)));
    toast({ title: "Saved", description: status === "listed" ? "Marked as listed on Chess-Results." : "Reset to not submitted." });

    // Re-ping IndexNow so Google picks up the change quickly
    try {
      await supabase.functions.invoke("indexnow-ping", { body: { urls: ["/dragan-brakus"] } });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo title="Admin · Chess-Results" description="Manage Chess-Results listing status." path="/admin/chess-results" />
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Chess-Results status</h1>
        <p className="text-muted-foreground mb-6">
          Paste the Chess-Results URL once the tournament is live there. Public pages will switch from
          "Pending submission" to "Listed on Chess-Results" automatically.
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

function RowEditor({ row, busy, onSave }: { row: Row; busy: boolean; onSave: (id: string, url: string) => void }) {
  const [url, setUrl] = useState(row.chess_results_url ?? "");
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
          placeholder="https://chess-results.com/tnr...aspx"
          className="flex-1"
        />
        <Button onClick={() => onSave(row.id, url)} disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </Button>
      </div>
    </Card>
  );
}
