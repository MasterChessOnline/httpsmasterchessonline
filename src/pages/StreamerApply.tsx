import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import { motion } from "framer-motion";
import { Radio, CheckCircle2, Coins, Palette, Trophy, Users2 } from "lucide-react";

const schema = z.object({
  organization_name: z.string().trim().min(2, "Channel name is required").max(120),
  contact_name: z.string().trim().min(2, "Your name is required").max(120),
  contact_email: z.string().trim().email("Valid email required").max(255),
  website_url: z.string().trim().url("Channel link must be a full URL").max(255),
  member_count: z.string().optional(),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().max(1500).optional().or(z.literal("")),
});

const PERKS = [
  { icon: Coins, title: "Revenue share", desc: "You earn from every supporter who joins with your code." },
  { icon: Palette, title: "OBS overlays", desc: "Live rating bar, custom accent colour, transparent background." },
  { icon: Trophy, title: "Your own tournament", desc: "A recurring arena named after your channel, run for free." },
  { icon: Users2, title: "Featured on site", desc: "Your stream surfaces on the MasterChess stream hub." },
];

export default function StreamerApply() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    organization_name: "",
    contact_name: "",
    contact_email: user?.email ?? "",
    website_url: "",
    member_count: "",
    city: "",
    country: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      toast.error(first ?? "Check your details");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("partner_applications").insert({
      user_id: user?.id ?? null,
      partner_type: "streamer",
      organization_name: form.organization_name.trim(),
      contact_name: form.contact_name.trim(),
      contact_email: form.contact_email.trim(),
      website_url: form.website_url.trim(),
      member_count: form.member_count ? Number(form.member_count) : null,
      city: form.city || null,
      country: form.country || null,
      message: form.message || null,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    setSubmitted(true);
    toast.success("Application sent — we reply within 48h.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Creator Program — Get Paid to Stream Chess | MasterChess"
        description="Micro-streamers welcome. Free OBS overlays, your own recurring tournament, an affiliate code and revenue share. Apply to the MasterChess Creator Program."
        path="/streamers/apply"
      />
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-bold uppercase tracking-wider text-primary mb-4">
            <Radio className="h-3 w-3" /> Creator Program
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight mb-3">
            We sign creators <span className="text-primary">before</span> they blow up
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            No follower minimum that matters. 300 viewers or 30,000 — if you stream chess, you
            get overlays, an affiliate code and your own tournament.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-3 mb-10">
          {PERKS.map((p) => (
            <Card key={p.title} className="p-5 border-primary/20 bg-card/70 backdrop-blur">
              <p.icon className="h-5 w-5 text-primary" />
              <div className="mt-3 font-bold">{p.title}</div>
              <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
            </Card>
          ))}
        </div>

        {submitted ? (
          <Card className="p-8 text-center border-primary/30 bg-primary/5">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-3" />
            <h2 className="font-display text-2xl font-black mb-2">You are in the queue</h2>
            <p className="text-muted-foreground text-sm mb-5">
              We review every application by hand and reply within 48 hours with your affiliate
              code and overlay links.
            </p>
            <Button asChild variant="outline">
              <Link to="/streamers">Grab your overlay in the meantime</Link>
            </Button>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8 border-primary/20 bg-card/70 backdrop-blur space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Channel name *</Label>
                <Input value={form.organization_name} onChange={set("organization_name")} placeholder="ChessWithMarko" />
              </div>
              <div>
                <Label>Your name *</Label>
                <Input value={form.contact_name} onChange={set("contact_name")} placeholder="Marko Marković" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={form.contact_email} onChange={set("contact_email")} placeholder="you@example.com" />
              </div>
              <div>
                <Label>Channel link *</Label>
                <Input value={form.website_url} onChange={set("website_url")} placeholder="https://twitch.tv/..." />
              </div>
              <div>
                <Label>Followers</Label>
                <Input type="number" inputMode="numeric" value={form.member_count} onChange={set("member_count")} placeholder="1200" />
              </div>
              <div>
                <Label>Country</Label>
                <Input value={form.country} onChange={set("country")} placeholder="Serbia" />
              </div>
            </div>
            <div>
              <Label>Tell us about your stream</Label>
              <Textarea
                value={form.message}
                onChange={set("message")}
                rows={4}
                placeholder="What you stream, how often, and what you want from us."
              />
            </div>
            <Button onClick={submit} disabled={submitting} size="lg" className="w-full">
              {submitting ? "Sending…" : "Apply to the Creator Program"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              We reply to every application within 48 hours.
            </p>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
