// Admin-only Google Business Profile post composer + scheduler.
// Posts are stored in `gbp_posts`. A cron-triggered edge function (`publish-gbp-posts`)
// flips `scheduled` -> `published` at the scheduled time; once a Google Business Profile
// API connection is added, the same function will push the post to GBP automatically.
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Calendar, Send, Trash2, ExternalLink } from "lucide-react";

interface GbpPost {
  id: string;
  title: string;
  body: string;
  cta_label: string | null;
  cta_url: string | null;
  image_url: string | null;
  scheduled_for: string | null;
  status: string;
  published_at: string | null;
  error: string | null;
  created_at: string;
}

const TEMPLATES = [
  { label: "Tournament announcement", title: "New tournament this weekend", body: "Join our free Swiss tournament on MasterChess this Saturday. Compete for the title, gain ELO, and earn unique badges. Open to all skill levels." },
  { label: "Champion shoutout", title: "Champion of the week", body: "Congratulations to our latest tournament winner! Watch the full game replay and learn from the moves on MasterChess." },
  { label: "Daily puzzle", title: "Daily chess puzzle is live", body: "Sharpen your tactics with today's puzzle on MasterChess. Free, no ads, just chess." },
];

export default function AdminGbpPosts() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<GbpPost[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("Play now");
  const [ctaUrl, setCtaUrl] = useState("https://masterchess.live");
  const [imageUrl, setImageUrl] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("gbp_posts").select("*").order("created_at", { ascending: false }).limit(50);
    setPosts((data as GbpPost[]) ?? []);
  };

  useEffect(() => {
    (async () => {
      if (!user) { setIsAdmin(false); return; }
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
      if (data) load();
    })();
  }, [user]);

  const save = async (status: "draft" | "scheduled") => {
    if (!title.trim() || !body.trim()) { toast.error("Title and body required"); return; }
    if (body.length > 1500) { toast.error("Body must be under 1500 characters (GBP limit)"); return; }
    if (status === "scheduled" && !scheduledFor) { toast.error("Pick a schedule date"); return; }
    setSaving(true);
    const { error } = await supabase.from("gbp_posts").insert({
      title: title.trim(),
      body: body.trim(),
      cta_label: ctaLabel.trim() || null,
      cta_url: ctaUrl.trim() || null,
      image_url: imageUrl.trim() || null,
      scheduled_for: status === "scheduled" ? new Date(scheduledFor).toISOString() : null,
      status,
      created_by: user!.id,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(status === "scheduled" ? "Post scheduled" : "Draft saved");
    setTitle(""); setBody(""); setImageUrl(""); setScheduledFor("");
    load();
  };

  const useTemplate = (t: typeof TEMPLATES[number]) => { setTitle(t.title); setBody(t.body); };

  const copyForGbp = (p: GbpPost) => {
    const text = `${p.title}\n\n${p.body}${p.cta_url ? `\n\n${p.cta_label || "Learn more"}: ${p.cta_url}` : ""}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied — paste into Google Business Profile → Add update");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("gbp_posts").delete().eq("id", id);
    load();
  };

  const markPublished = async (id: string) => {
    await supabase.from("gbp_posts").update({ status: "published", published_at: new Date().toISOString() }).eq("id", id);
    load();
  };

  if (isAdmin === null) return null;
  if (!isAdmin) return (
    <div className="min-h-screen bg-background"><Navbar /><main className="container mx-auto py-16 text-center text-muted-foreground">Admin only.</main><Footer /></div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet><title>Google Posts (Admin)</title><meta name="robots" content="noindex" /></Helmet>
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Google Posts Composer</h1>
          <p className="text-sm text-muted-foreground mt-1">Compose and schedule updates for your Google Business Profile. Copy-paste workflow until GBP API is connected.</p>
        </div>

        <Card className="p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map(t => (
              <Button key={t.label} variant="outline" size="sm" onClick={() => useTemplate(t)}>{t.label}</Button>
            ))}
          </div>
          <div className="grid gap-3">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="New tournament this weekend" maxLength={120} />
            </div>
            <div>
              <Label>Body <span className="text-xs text-muted-foreground">({body.length}/1500)</span></Label>
              <Textarea value={body} onChange={e => setBody(e.target.value)} rows={5} maxLength={1500} placeholder="What's new on MasterChess..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>CTA label</Label><Input value={ctaLabel} onChange={e => setCtaLabel(e.target.value)} placeholder="Play now" /></div>
              <div><Label>CTA URL</Label><Input value={ctaUrl} onChange={e => setCtaUrl(e.target.value)} placeholder="https://masterchess.live" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Image URL (optional)</Label><Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://masterchess.live/og-image.jpg" /></div>
              <div><Label>Schedule for</Label><Input type="datetime-local" value={scheduledFor} onChange={e => setScheduledFor(e.target.value)} /></div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => save("draft")} disabled={saving} variant="outline">Save draft</Button>
            <Button onClick={() => save("scheduled")} disabled={saving}><Calendar className="w-4 h-4 mr-1" />Schedule</Button>
            <a href="https://business.google.com" target="_blank" rel="noopener noreferrer" className="ml-auto">
              <Button variant="ghost" size="sm"><ExternalLink className="w-4 h-4 mr-1" />Open GBP</Button>
            </a>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold mb-3">Posts ({posts.length})</h2>
          {!posts.length && <p className="text-sm text-muted-foreground">No posts yet.</p>}
          <div className="space-y-3">
            {posts.map(p => (
              <div key={p.id} className="border rounded-lg p-3 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={p.status === "published" ? "default" : p.status === "scheduled" ? "secondary" : p.status === "failed" ? "destructive" : "outline"}>{p.status}</Badge>
                      {p.scheduled_for && <span className="text-xs text-muted-foreground">scheduled {new Date(p.scheduled_for).toLocaleString()}</span>}
                      {p.published_at && <span className="text-xs text-muted-foreground">published {new Date(p.published_at).toLocaleString()}</span>}
                    </div>
                    <div className="font-semibold mt-1 truncate">{p.title}</div>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">{p.body}</div>
                    {p.error && <div className="text-xs text-destructive mt-1">{p.error}</div>}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => copyForGbp(p)}><Copy className="w-3 h-3 mr-1" />Copy</Button>
                    {p.status !== "published" && <Button size="sm" variant="ghost" onClick={() => markPublished(p.id)}><Send className="w-3 h-3 mr-1" />Mark posted</Button>}
                    <Button size="sm" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 text-xs text-muted-foreground">
          <strong className="text-foreground">Workflow:</strong> Compose → Schedule. A cron-triggered backend job (<code>publish-gbp-posts</code>) runs every 15 minutes — when a post is due, it's copied to your clipboard via the admin UI, or pushed directly to GBP once the Google Business Profile API connector is added. Until then, "Copy" + paste into <a className="underline" href="https://business.google.com" target="_blank" rel="noopener noreferrer">business.google.com</a> → Add update.
        </Card>
      </main>
      <Footer />
    </div>
  );
}
