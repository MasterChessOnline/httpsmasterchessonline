import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Result = { fn: string; status: number; body: unknown } | null;

export default function AdminGrowthHub() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<Result>(null);

  // Semrush
  const [semDomain, setSemDomain] = useState("masterchess.live");
  const [semPhrase, setSemPhrase] = useState("chess battle royale");
  // Resend
  const [emailTo, setEmailTo] = useState("");
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastHtml, setBroadcastHtml] = useState("");
  // LinkedIn
  const [liText, setLiText] = useState("New Battle Royale on MasterChess.live — 8 players, 1 winner ♟️");
  // TikTok
  const [ttVideoUrl, setTtVideoUrl] = useState("");
  const [ttTitle, setTtTitle] = useState("Clutch endgame on MasterChess.live ♟️");

  async function call(fn: string, body: Record<string, unknown>) {
    setLoading(fn);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke(fn, { body });
      if (error) throw error;
      setResult({ fn, status: 200, body: data });
      toast.success(`${fn} ✓`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setResult({ fn, status: 500, body: { error: msg } });
      toast.error(`${fn}: ${msg}`);
    } finally {
      setLoading(null);
    }
  }

  const Btn = ({ id, onClick, children }: { id: string; onClick: () => void; children: React.ReactNode }) => (
    <Button onClick={onClick} disabled={loading === id} variant="secondary" size="sm">
      {loading === id ? <Loader2 className="w-3 h-3 animate-spin" /> : children}
    </Button>
  );

  return (
    <div className="min-h-screen bg-background p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Growth Hub</h1>
      <p className="text-muted-foreground mb-6">Every connector, every action, one panel.</p>

      <Tabs defaultValue="semrush">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="semrush">Semrush</TabsTrigger>
          <TabsTrigger value="gsc">GSC</TabsTrigger>
          <TabsTrigger value="resend">Resend</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="tiktok">TikTok</TabsTrigger>
        </TabsList>

        <TabsContent value="semrush">
          <Card className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Domain" value={semDomain} onChange={(e) => setSemDomain(e.target.value)} />
              <Input placeholder="Keyword phrase" value={semPhrase} onChange={(e) => setSemPhrase(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Btn id="sem-limits" onClick={() => call("semrush-intel", { action: "limits" })}>Quota</Btn>
              <Btn id="sem-overview" onClick={() => call("semrush-intel", { action: "overview", domain: semDomain })}>Domain overview</Btn>
              <Btn id="sem-keywords" onClick={() => call("semrush-intel", { action: "keywords", phrase: semPhrase })}>Keyword research</Btn>
              <Btn id="sem-backlinks" onClick={() => call("semrush-intel", { action: "backlinks", domain: semDomain })}>Backlinks</Btn>
              <Btn id="sem-competitors" onClick={() => call("semrush-intel", { action: "competitors", domain: semDomain })}>Competitors</Btn>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="gsc">
          <Card className="p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Btn id="gsc-audit" onClick={() => call("gsc-full-audit", {})}>Full 28-day audit</Btn>
              <Btn id="gsc-status" onClick={() => call("gsc-status", {})}>Status</Btn>
              <Btn id="gsc-submit" onClick={() => call("submit-sitemaps-gsc", {})}>Submit sitemaps</Btn>
              <Btn id="gsc-index" onClick={() => call("google-indexing-ping", { url: "https://masterchess.live/" })}>Ping index</Btn>
              <Btn id="gsc-idxnow" onClick={() => call("indexnow-ping", {})}>IndexNow ping</Btn>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="resend">
          <Card className="p-4 space-y-3">
            <Input placeholder="to@example.com" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <Btn id="rs-welcome" onClick={() => call("resend-campaign", { action: "welcome", to: emailTo })}>Send welcome</Btn>
              <Btn id="rs-reengage" onClick={() => call("resend-campaign", { action: "reengage", days: 7 })}>Re-engage (7d idle)</Btn>
            </div>
            <div className="pt-2 border-t space-y-2">
              <Input placeholder="Broadcast subject" value={broadcastSubject} onChange={(e) => setBroadcastSubject(e.target.value)} />
              <Textarea placeholder="HTML body" value={broadcastHtml} onChange={(e) => setBroadcastHtml(e.target.value)} rows={4} />
              <Btn id="rs-broadcast" onClick={() => call("resend-campaign", { action: "broadcast", to: emailTo, subject: broadcastSubject, html: broadcastHtml })}>Send custom</Btn>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="linkedin">
          <Card className="p-4 space-y-3">
            <Textarea placeholder="Post text" value={liText} onChange={(e) => setLiText(e.target.value)} rows={4} />
            <div className="flex flex-wrap gap-2">
              <Btn id="li-profile" onClick={() => call("linkedin-publish", { action: "profile" })}>My profile</Btn>
              <Btn id="li-post" onClick={() => call("linkedin-publish", { action: "post", text: liText, articleUrl: "https://masterchess.live", articleTitle: "MasterChess.live" })}>Publish post</Btn>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tiktok">
          <Card className="p-4 space-y-3">
            <Input placeholder="Public MP4 URL" value={ttVideoUrl} onChange={(e) => setTtVideoUrl(e.target.value)} />
            <Input placeholder="Title" value={ttTitle} onChange={(e) => setTtTitle(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <Btn id="tt-profile" onClick={() => call("tiktok-publish", { action: "profile" })}>My profile</Btn>
              <Btn id="tt-videos" onClick={() => call("tiktok-publish", { action: "videos" })}>My videos</Btn>
              <Btn id="tt-creator" onClick={() => call("tiktok-publish", { action: "creator_info" })}>Creator info</Btn>
              <Btn id="tt-publish" onClick={() => call("tiktok-publish", { action: "publish", videoUrl: ttVideoUrl, title: ttTitle })}>Publish video</Btn>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {result && (
        <Card className="p-4 mt-6">
          <div className="text-xs text-muted-foreground mb-2">{result.fn} · {result.status}</div>
          <pre className="text-xs overflow-auto max-h-96 bg-muted p-3 rounded">{JSON.stringify(result.body, null, 2)}</pre>
        </Card>
      )}
    </div>
  );
}
