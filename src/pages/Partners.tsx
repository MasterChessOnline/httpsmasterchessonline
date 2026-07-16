import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import VerifiedBadge from "@/components/VerifiedBadge";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import {
  Building2,
  GraduationCap,
  User as UserIcon,
  Trophy,
  CheckCircle2,
  Link2,
  BarChart3,
  Sparkles,
} from "lucide-react";

const schema = z.object({
  partner_type: z.enum(["club", "coach", "school", "federation", "organizer"]),
  organization_name: z.string().trim().min(2).max(120),
  contact_name: z.string().trim().min(2).max(120),
  contact_email: z.string().trim().email().max(255),
  contact_phone: z.string().trim().max(40).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  member_count: z.string().optional(),
  website_url: z.string().trim().url().max(255).optional().or(z.literal("")),
  message: z.string().trim().max(1500).optional().or(z.literal("")),
});

const TYPES = [
  { id: "club", label: "Šahovski klub", icon: Building2 },
  { id: "coach", label: "Trener", icon: UserIcon },
  { id: "school", label: "Škola", icon: GraduationCap },
  { id: "federation", label: "Savez / federacija", icon: Trophy },
  { id: "organizer", label: "Organizator turnira", icon: Sparkles },
] as const;

const BENEFITS = [
  { icon: VerifiedBadge, title: "Verifikovana oznaka", desc: "Zlatna kvačica pored imena." },
  { icon: Link2, title: "Vlastita stranica", desc: "masterchess.live/club/tvoj-klub" },
  { icon: Trophy, title: "Besplatni turniri", desc: "Klupski, školski, otvoreni." },
  { icon: BarChart3, title: "Statistika igrača", desc: "Vidiš aktivnost i rejtinge svojih članova." },
];

export default function Partners() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    partner_type: "club" as (typeof TYPES)[number]["id"],
    organization_name: "",
    contact_name: "",
    contact_email: user?.email ?? "",
    contact_phone: "",
    city: "",
    country: "Srbija",
    member_count: "",
    website_url: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Postani MasterChess Partner — Klubovi, treneri, škole";
    const md = document.querySelector('meta[name="description"]');
    md?.setAttribute(
      "content",
      "Pridruži se MasterChess Partner Programu. Verifikovana oznaka, javna stranica kluba, besplatni turniri i alati za trenere.",
    );
  }, []);

  useEffect(() => {
    if (user?.email && !form.contact_email) setForm((f) => ({ ...f, contact_email: user.email! }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      toast.error(first ?? "Proveri unos");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("partner_applications").insert({
      user_id: user?.id ?? null,
      partner_type: form.partner_type,
      organization_name: form.organization_name.trim(),
      contact_name: form.contact_name.trim(),
      contact_email: form.contact_email.trim(),
      contact_phone: form.contact_phone || null,
      city: form.city || null,
      country: form.country || null,
      member_count: form.member_count ? Number(form.member_count) : null,
      website_url: form.website_url || null,
      message: form.message || null,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    setSubmitted(true);
    toast.success("Prijava poslata! Javićemo se u roku od 48h.");
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100">
      {/* Hero */}
      <section className="border-b border-neutral-900 bg-gradient-to-b from-amber-500/10 to-transparent">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 mb-4">
            MasterChess Partner Program
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Postani MasterChess partner
          </h1>
          <p className="mt-4 text-neutral-300 max-w-2xl mx-auto">
            Klubovi, treneri, škole i organizatori — dobijte <b>verifikovanu oznaku</b>,
            javnu stranicu i besplatne alate za organizovanje turnira i praćenje igrača.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-3">
        {BENEFITS.map((b) => (
          <Card key={b.title} className="p-5 bg-neutral-950 border-neutral-900">
            <b.icon />
            <div className="mt-3 font-semibold">{b.title}</div>
            <div className="text-xs text-neutral-400 mt-1">{b.desc}</div>
          </Card>
        ))}
      </section>

      {/* Type explainer */}
      <section className="max-w-5xl mx-auto px-4 pb-10 grid md:grid-cols-3 gap-4">
        <Card className="p-6 bg-neutral-950 border-neutral-900">
          <Building2 className="text-amber-400 mb-2" />
          <div className="font-bold">Za klubove</div>
          <ul className="mt-2 text-sm text-neutral-300 space-y-1 list-disc pl-4">
            <li>Zvanična stranica sa članovima</li>
            <li>Klupska liga (uskoro)</li>
            <li>Klupski turniri</li>
            <li>Kalendar događaja</li>
          </ul>
        </Card>
        <Card className="p-6 bg-neutral-950 border-neutral-900">
          <UserIcon className="text-amber-400 mb-2" />
          <div className="font-bold">Za trenere</div>
          <ul className="mt-2 text-sm text-neutral-300 space-y-1 list-disc pl-4">
            <li>Privatni klub za učenike</li>
            <li>Praćenje napretka (uskoro)</li>
            <li>Verifikovan profil</li>
          </ul>
        </Card>
        <Card className="p-6 bg-neutral-950 border-neutral-900">
          <GraduationCap className="text-amber-400 mb-2" />
          <div className="font-bold">Za škole i organizatore</div>
          <ul className="mt-2 text-sm text-neutral-300 space-y-1 list-disc pl-4">
            <li>Školske lige i takmičenja odeljenja</li>
            <li>Stranica turnira sa live tabelom</li>
            <li>Rang-lista škola/klubova</li>
          </ul>
        </Card>
      </section>

      {/* Form */}
      <section id="apply" className="max-w-2xl mx-auto px-4 pb-20">
        <Card className="p-6 bg-neutral-950 border-neutral-900">
          <h2 className="text-2xl font-bold mb-1">Prijava</h2>
          <p className="text-sm text-neutral-400 mb-6">
            Popuni formu — odgovaramo u roku od 48h. Sve je besplatno.
          </p>

          {submitted ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto text-green-400" size={48} />
              <div className="mt-3 text-xl font-bold">Prijava poslata!</div>
              <p className="text-neutral-400 mt-2 text-sm">
                Proveri email — kontaktiraćemo te uskoro.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label>Tip partnera</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm({ ...form, partner_type: t.id })}
                      className={`p-3 rounded-lg border text-xs flex flex-col items-center gap-1 transition ${
                        form.partner_type === t.id
                          ? "border-amber-500 bg-amber-500/10 text-amber-300"
                          : "border-neutral-800 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      <t.icon size={18} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Ime organizacije / kluba / škole *</Label>
                <Input
                  value={form.organization_name}
                  onChange={(e) => setForm({ ...form, organization_name: e.target.value })}
                  maxLength={120}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Ime kontakt osobe *</Label>
                  <Input
                    value={form.contact_name}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    maxLength={120}
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    maxLength={255}
                  />
                </div>
                <div>
                  <Label>Telefon</Label>
                  <Input
                    value={form.contact_phone}
                    onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                    maxLength={40}
                  />
                </div>
                <div>
                  <Label>Grad</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    maxLength={80}
                  />
                </div>
                <div>
                  <Label>Država</Label>
                  <Input
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    maxLength={80}
                  />
                </div>
                <div>
                  <Label>Broj članova</Label>
                  <Input
                    type="number"
                    value={form.member_count}
                    onChange={(e) => setForm({ ...form, member_count: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Website</Label>
                <Input
                  value={form.website_url}
                  onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                  placeholder="https://…"
                  maxLength={255}
                />
              </div>

              <div>
                <Label>Poruka</Label>
                <Textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  maxLength={1500}
                  placeholder="Ispričaj nam ukratko o sebi i kako želiš da koristiš MasterChess."
                />
              </div>

              <Button
                onClick={submit}
                disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black"
              >
                {submitting ? "Šaljem…" : "Pošalji prijavu"}
              </Button>
              <p className="text-xs text-neutral-500 text-center">
                Odgovaramo u roku od 48h. Sve je besplatno.
              </p>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
