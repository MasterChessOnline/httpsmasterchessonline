// Admin wizard for connecting a custom Google Maps API key to masterchess.live.
// The Lovable-managed Maps key only works on *.lovable.app; the live domain
// needs its own key. This page walks through enabling APIs, restricting the
// key, and verifying it works.
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function AdminMapsSetup() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; status?: number; error?: string; hint?: string } | null>(null);

  useEffect(() => {
    (async () => {
      if (!user) return setIsAdmin(false);
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
    })();
  }, [user]);

  const test = async () => {
    setTesting(true);
    setResult(null);
    const { data, error } = await supabase.functions.invoke("test-maps-key", {
      body: { apiKey: apiKey.trim(), referer: "https://masterchess.live/" },
    });
    setTesting(false);
    if (error) {
      setResult({ ok: false, error: error.message });
      toast.error("Test failed");
      return;
    }
    setResult(data);
    if (data?.ok) toast.success("API key works on masterchess.live ✓");
    else toast.error(data?.hint || data?.error || "Key rejected");
  };

  if (isAdmin === null) return null;
  if (!isAdmin)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-16 text-center text-muted-foreground">Admin only.</main>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Maps Setup (Admin)</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Google Maps — Custom Domain Setup</h1>
          <p className="text-muted-foreground mt-1">
            The Lovable-managed Maps key is locked to <code>*.lovable.app</code>. <strong>masterchess.live</strong> needs
            its own key from Google Cloud.
          </p>
        </header>

        <Card className="p-5 space-y-4">
          <h2 className="font-semibold text-lg">Step-by-step</h2>
          <ol className="space-y-3 list-decimal pl-5 text-sm">
            <li>
              <strong>Create a Google Cloud project & enable billing.</strong>{" "}
              <a className="text-amber-400 hover:underline inline-flex items-center gap-1" href="https://console.cloud.google.com/projectcreate" target="_blank" rel="noreferrer">
                Open <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              <strong>Enable APIs:</strong> Maps JavaScript API, Places API (New), Geocoding API.{" "}
              <a className="text-amber-400 hover:underline inline-flex items-center gap-1" href="https://console.cloud.google.com/apis/library" target="_blank" rel="noreferrer">
                API Library <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              <strong>Create an API key:</strong> APIs & Services → Credentials → Create credentials → API key.{" "}
              <a className="text-amber-400 hover:underline inline-flex items-center gap-1" href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">
                Credentials <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              <strong>Restrict the key — HTTP referrers:</strong>
              <pre className="mt-2 bg-zinc-900 text-amber-200 p-2 rounded text-xs">
                {`https://masterchess.live/*\nhttps://www.masterchess.live/*\nhttps://*.masterchess.live/*`}
              </pre>
              Also restrict by API to the three enabled above.
            </li>
            <li>
              <strong>Paste the key below</strong> and click <em>Test</em>. If it passes, connect it in the Lovable
              Maps connector as a custom (non-managed) connection.
            </li>
          </ol>
        </Card>

        <Card className="p-5 space-y-3">
          <h2 className="font-semibold text-lg">Live test</h2>
          <Input
            type="password"
            placeholder="AIza... (Google Maps API key)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={test} disabled={!apiKey.trim() || testing}>
              {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Test on masterchess.live
            </Button>
          </div>
          {result && (
            <div
              className={`p-3 rounded border text-sm flex items-start gap-2 ${
                result.ok
                  ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-200"
                  : "border-rose-500/40 bg-rose-500/5 text-rose-200"
              }`}
            >
              {result.ok ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-semibold">
                  {result.ok ? "Key is valid for masterchess.live" : `Failed${result.status ? ` (HTTP ${result.status})` : ""}`}
                </div>
                {result.hint && <div className="text-xs">{result.hint}</div>}
                {result.error && (
                  <pre className="text-[10px] opacity-70 whitespace-pre-wrap">{result.error}</pre>
                )}
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            The test sends a Places API search with the <code>Referer: https://masterchess.live/</code> header.
            If Google rejects it, your referrer restrictions don't include the live domain.
          </p>
        </Card>

        <Card className="p-5 space-y-2">
          <h2 className="font-semibold">Current status</h2>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="border-amber-500/40">Connector</Badge>
            <span className="text-muted-foreground">
              Managed (Lovable) — works on preview only. Add a custom connection for the live domain.
            </span>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
