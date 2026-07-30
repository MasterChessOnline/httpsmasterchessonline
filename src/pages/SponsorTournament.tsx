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
import { Handshake, CheckCircle2, Megaphone, Link2, Trophy, BarChart3 } from "lucide-react";

const schema = z.object({
  organization_name: z.string().trim().min(2, "Business name is required").max(120),
  contact_name: z.string().trim().min(2, "Contact name is required").max(120),
  contact_email: z.string().trim().email("Valid email required").max(255),
  contact_phone: z.string().trim().max(40).optional().or(z.literal("")),
  website_url: z.string().trim().url("Website must be a full URL").max(255).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().max(1500).optional().or(z.literal("")),
});

const INCLUDED = [
  { icon: Trophy, title: "A tournament with your name", desc: "\"Your Brand Blitz\" — recurring, on the public calendar." },
  { icon: Megaphone, title: "Logo on the board", desc: "Your logo on the lobby, standings page and result share cards." },
  { icon: Link2, title: "A do-follow link", desc: "Permanent sponsor page linking to your site." },
  { icon: BarChart3, title: "Real numbers", desc: "Players, views and click-throughs reported after every edition." },
];

export default function SponsorTournament() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    organization_name: "",
    contact_name: "",
    contact_email: user?.email ?? "",
    contact_phone: "",
    website_url: "",
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
      partner_type: "sponsor",
      organization_name: form.organization_name.trim(),
      contact_name: form.contact_name.trim(),
      contact_email: form.contact_email.trim(),
      contact_phone: form.contact_phone || null,
      website_url: form.website_url || null,
      city: form.city || null,
      country: form.country || null,
      message: form.message || null,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    setSubmitted(true);
    toast.success("Request sent — we reply within 48h.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Sponsor a Chess Tournament — From €50 | MasterChess"
        description="Any business can sponsor its own online chess tournament on MasterChess. Your name on the event, your logo on the board, a permanent sponsor page and real audience numbers."
        path="/sponsor-a-tournament"
      />
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-bold uppercase tracking-wider text-primary mb-4">
            <Handshake className="h-3 w-3" /> Sponsorship
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight mb-3">
            Put your name on a <span className="text-primary">chess tournament</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            You do not need a marketing agency or a five-figure budget. A local bakery can
            sponsor a blitz arena for the price of a weekend ad — and keep the link forever.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-3 mb-10">
          {INCLUDED.map((p) => (
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
            <h2 className="font-display text-2xl font-black mb-2">Request received</h2>
            <p className="text-muted-foreground text-sm mb-5">
              We will email you a proposed date, format and mock-up of your branded lobby
              within 48 hours.
            </p>
            <Button asChild variant="outline">
              <Link to="/tournaments">See current tournaments</Link>
            </Button>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8 border-primary/20 bg-card/70 backdrop-blur space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Business name *</Label>
                <Input value={form.organization_name} onChange={set("organization_name")} placeholder="Pekara Zlatni Klas" />
              </div>
              <div>
                <Label>Contact person *</Label>
                <Input value={form.contact_name} onChange={set("contact_name")} placeholder="Jovana Jović" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={form.contact_email} onChange={set("contact_email")} placeholder="you@business.com" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.contact_phone} onChange={set("contact_phone")} placeholder="+381 …" />
              </div>
              <div>
                <Label>Website</Label>
                <Input value={form.website_url} onChange={set("website_url")} placeholder="https://…" />
              </div>
              <div>
                <Label>City</Label>
                <Input value={form.city} onChange={set("city")} placeholder="Beograd" />
              </div>
            </div>
            <div>
              <Label>What do you want out of it?</Label>
              <Textarea
                value={form.message}
                onChange={set("message")}
                rows={4}
                placeholder="Budget, preferred date, audience you want to reach."
              />
            </div>
            <Button onClick={submit} disabled={submitting} size="lg" className="w-full">
              {submitting ? "Sending…" : "Request a sponsored tournament"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              No payment now — we send a proposal first.
            </p>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
