import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Copy, Link as LinkIcon, Wand2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const BASE = "https://masterchess.live";

const PRESETS = [
  { label: "Google Ads — Search",  source: "google",   medium: "cpc",    campaign: "search-srb" },
  { label: "Instagram — Bio",      source: "instagram",medium: "social", campaign: "bio" },
  { label: "Instagram — Story",    source: "instagram",medium: "social", campaign: "story" },
  { label: "TikTok — Bio",         source: "tiktok",   medium: "social", campaign: "bio" },
  { label: "YouTube — Description",source: "youtube",  medium: "social", campaign: "video-desc" },
  { label: "Reddit r/chess",       source: "reddit",   medium: "social", campaign: "rchess" },
  { label: "WhatsApp share",       source: "whatsapp", medium: "messenger", campaign: "share" },
  { label: "Email — Newsletter",   source: "newsletter",medium: "email",  campaign: "weekly" },
];

const PATHS = ["/", "/play", "/sah-online", "/puzzles", "/tournaments", "/beat/magnus-bot", "/openings"];

export default function UtmBuilder() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [path, setPath] = useState("/play");
  const [source, setSource] = useState("google");
  const [medium, setMedium] = useState("cpc");
  const [campaign, setCampaign] = useState("search-srb");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login"); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(Boolean(data));
    });
  }, [user, loading, navigate]);

  const built = useMemo(() => {
    const u = new URL(BASE + path);
    if (source) u.searchParams.set("utm_source", source);
    if (medium) u.searchParams.set("utm_medium", medium);
    if (campaign) u.searchParams.set("utm_campaign", campaign);
    if (term) u.searchParams.set("utm_term", term);
    if (content) u.searchParams.set("utm_content", content);
    return u.toString();
  }, [path, source, medium, campaign, term, content]);

  const copy = async () => {
    await navigator.clipboard.writeText(built);
    toast({ title: "Copied", description: built });
  };

  if (loading || isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card><CardContent className="p-8">Admin only.</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="UTM Link Builder — MasterChess Admin"
        description="Generate campaign-tagged URLs for Google Ads, social, and email so traffic shows up correctly in analytics."
        path="/utm"
      />
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Wand2 className="h-3.5 w-3.5 text-primary" /> Campaign URL builder
          </div>
          <h1 className="text-3xl font-semibold">UTM Link Builder</h1>
          <p className="text-sm text-muted-foreground">Tag every external link so GA4 attributes signups to the right channel.</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Quick presets</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Badge
                key={p.label}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => { setSource(p.source); setMedium(p.medium); setCampaign(p.campaign); }}
              >
                {p.label}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-xs">Landing path</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
                {PATHS.map((p) => (
                  <Badge key={p} variant={path === p ? "default" : "outline"} className="cursor-pointer" onClick={() => setPath(p)}>
                    {p}
                  </Badge>
                ))}
              </div>
              <Input value={path} onChange={(e) => setPath(e.target.value.startsWith("/") ? e.target.value : "/" + e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><Label className="text-xs">Source *</Label><Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="google" /></div>
              <div><Label className="text-xs">Medium *</Label><Input value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="cpc" /></div>
              <div><Label className="text-xs">Campaign *</Label><Input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="search-srb" /></div>
              <div><Label className="text-xs">Term (keyword)</Label><Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="igraj sah" /></div>
              <div className="md:col-span-2"><Label className="text-xs">Content (ad variant)</Label><Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="hero-cta-v1" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/40">
          <CardContent className="p-6 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><LinkIcon className="h-3.5 w-3.5" /> Result</div>
            <code className="block break-all text-sm bg-muted/40 rounded-md p-3">{built}</code>
            <Button onClick={copy} className="w-full"><Copy className="h-4 w-4 mr-2" />Copy link</Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
