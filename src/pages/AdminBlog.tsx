// Admin-only DB blog editor. Adds DB-backed posts shown alongside static guides.
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/news";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Row { id: string; slug: string; title: string; status: string; published_at: string | null; }

export default function AdminBlog() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [tags, setTags] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.rpc("has_role" as any, { _user_id: user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("blog_posts" as any).select("id,slug,title,status,published_at").order("created_at", { ascending: false }).then(({ data }) => setRows((data as any) ?? []));
  }, [isAdmin, busy]);

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !title.trim() || !bodyMd.trim()) return;
    setBusy(true);
    const slug = slugify(title);
    const minutes = Math.max(1, Math.round(bodyMd.split(/\s+/).length / 200));
    const { error } = await supabase.from("blog_posts" as any).insert({
      slug, title, excerpt: excerpt || bodyMd.slice(0, 160), body_md: bodyMd,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      status: "published", published_at: new Date().toISOString(), reading_minutes: minutes, author_id: user.id,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setTitle(""); setExcerpt(""); setBodyMd(""); setTags("");
    toast.success("Published");
  }

  if (isAdmin === null) return null;
  if (!isAdmin) return <div className="min-h-screen bg-background text-foreground"><Navbar /><main className="container mx-auto px-4 py-12 text-center text-muted-foreground">Admins only.</main></div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="font-display text-3xl font-bold mb-6">Blog admin</h1>
        <div className="grid lg:grid-cols-2 gap-6">
          <form onSubmit={publish} className="space-y-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required className="w-full p-2.5 rounded-lg bg-card/60 border border-border/40" />
            <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Excerpt" className="w-full p-2.5 rounded-lg bg-card/60 border border-border/40" />
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tags, comma, separated" className="w-full p-2.5 rounded-lg bg-card/60 border border-border/40" />
            <textarea value={bodyMd} onChange={(e) => setBodyMd(e.target.value)} rows={18} placeholder="# Markdown body…" required className="w-full p-2.5 rounded-lg bg-card/60 border border-border/40 font-mono text-sm" />
            <button disabled={busy} className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold">
              {busy ? "Publishing…" : "Publish"}
            </button>
          </form>
          <div className="rounded-lg border border-border/40 bg-card/30 p-4 prose prose-invert max-w-none overflow-auto">
            {bodyMd ? <ReactMarkdown>{bodyMd}</ReactMarkdown> : <p className="text-muted-foreground">Preview…</p>}
          </div>
        </div>

        <h2 className="font-display text-xl font-semibold mt-10 mb-3">Posts</h2>
        <ul className="divide-y divide-border/30">
          {rows.map((r) => (
            <li key={r.id} className="py-2 flex items-center justify-between">
              <span>{r.title} <span className="text-xs text-muted-foreground ml-2">/{r.slug}</span></span>
              <span className="text-xs text-muted-foreground">{r.status}</span>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}
