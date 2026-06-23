import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/news";
import { toast } from "sonner";

export default function NewsSubmit() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto px-4 py-12 max-w-xl text-center">
          <h1 className="font-display text-2xl font-bold mb-3">Sign in to submit</h1>
          <p className="text-muted-foreground mb-5">You need an account to post to the News feed.</p>
          <Link to="/login" className="inline-block px-5 py-2 rounded-lg bg-amber-500 text-black font-semibold">Sign in</Link>
        </main>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || (!url.trim() && !body.trim())) {
      toast.error("Title plus a URL or text is required");
      return;
    }
    setBusy(true);
    const baseSlug = slugify(title) || "post";
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;
    const { data, error } = await supabase.from("news_posts" as any).insert({
      title: title.trim(),
      slug,
      url: url.trim() || null,
      body_md: body.trim() || null,
      kind: "community",
      author_id: user!.id,
    }).select("slug").single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Submitted!");
    nav(`/news/${(data as any).slug}`);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo title="Submit to MasterChess News" description="Share a chess link, tournament announcement, or community story with the MasterChess feed." path="/news/submit" />
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="font-display text-3xl font-bold mb-2">Submit a post</h1>
        <p className="text-muted-foreground text-sm mb-6">Share a link or write a short story. Community posts go in the feed for upvotes.</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} className="w-full rounded-lg bg-card/60 border border-border/40 p-2.5 text-sm focus:outline-none focus:border-amber-400/50" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">URL <span className="text-muted-foreground">(optional)</span></label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="w-full rounded-lg bg-card/60 border border-border/40 p-2.5 text-sm focus:outline-none focus:border-amber-400/50" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Text <span className="text-muted-foreground">(optional, markdown)</span></label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className="w-full rounded-lg bg-card/60 border border-border/40 p-2.5 text-sm font-mono focus:outline-none focus:border-amber-400/50" />
          </div>
          <button type="submit" disabled={busy} className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold">
            {busy ? "Submitting…" : "Submit"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
