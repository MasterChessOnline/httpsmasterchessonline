import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Trophy, Search, Zap } from "lucide-react";

interface FormState {
  first_name: string;
  last_name: string;
  federation: string;
  city: string;
  club: string;
  fide_id: string;
  fide_title: string;
  birth_year: string;
}

const initial: FormState = {
  first_name: "", last_name: "", federation: "", city: "", club: "",
  fide_id: "", fide_title: "", birth_year: "",
};

export default function TournamentRegister() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState<FormState>(initial);
  const [tournament, setTournament] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fideBusy, setFideBusy] = useState(false);

  const lookupFide = async () => {
    const id = form.fide_id.trim();
    if (!/^\d{4,10}$/.test(id)) {
      toast({ title: "Enter a valid FIDE ID", description: "Numeric, 4–10 digits.", variant: "destructive" });
      return;
    }
    setFideBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("fide-lookup", {
        method: "GET" as any,
        body: undefined,
        // pass via query string
        headers: {},
      } as any);
      // The supabase-js client doesn't support query params on invoke cleanly — fall back to fetch.
      let json: any = data;
      if (error || !json?.name) {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fide-lookup?id=${id}`;
        const r = await fetch(url, { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } });
        json = await r.json();
      }
      if (!json?.name) {
        toast({ title: "FIDE profile not found", description: json?.error || "Check the ID.", variant: "destructive" });
        return;
      }
      // FIDE names come as "LASTNAME, Firstname" — split sensibly.
      const raw: string = json.name;
      let first = "", last = "";
      if (raw.includes(",")) {
        const [l, f] = raw.split(",").map((s: string) => s.trim());
        last = l; first = f;
      } else {
        const parts = raw.trim().split(/\s+/);
        first = parts.slice(0, -1).join(" ") || parts[0];
        last = parts.length > 1 ? parts[parts.length - 1] : "";
      }
      setForm(s => ({
        ...s,
        first_name: first || s.first_name,
        last_name: last || s.last_name,
        federation: json.federation || s.federation,
        fide_title: json.title || s.fide_title,
        birth_year: json.birth_year ? String(json.birth_year) : s.birth_year,
      }));
      toast({ title: `Found: ${raw}`, description: `${json.federation || ""}${json.rating ? " · " + json.rating : ""}` });
    } finally {
      setFideBusy(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: t } = await supabase.from("tournaments").select("*").eq("id", id).single();
      setTournament(t);
      if (user) {
        const [{ data: profile }, { data: priv }] = await Promise.all([
          supabase
            .from("profiles")
            .select("federation, country, club, fide_id, fide_title, city")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase.rpc("get_my_private_profile"),
        ]);
        const p: any = Array.isArray(priv) ? priv[0] : priv;
        if (profile || p) {
          setForm({
            first_name: p?.first_name || "",
            last_name: p?.last_name || "",
            federation: (profile?.federation || profile?.country || "").toUpperCase(),
            city: profile?.city || "",
            club: profile?.club || "",
            fide_id: profile?.fide_id || "",
            fide_title: profile?.fide_title || "",
            birth_year: p?.birth_year ? String(p.birth_year) : "",
          });
        }
      }

      setLoading(false);
    })();
  }, [id, user?.id]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <Card className="max-w-md mx-auto p-6 text-center">
            <p className="mb-4">Please sign in to register for tournaments.</p>
            <Button onClick={() => navigate("/auth")}>Sign in</Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 text-center">
          <p>Tournament not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const handle = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(s => ({ ...s, [k]: e.target.value }));

  const validate = (): string | null => {
    if (!form.first_name.trim()) return "First name is required.";
    if (!form.last_name.trim()) return "Last name is required.";
    if (form.fide_id && !/^\d+$/.test(form.fide_id.trim())) return "FIDE ID must be numeric.";
    if (form.birth_year && !/^\d{4}$/.test(form.birth_year.trim())) return "Birth year must be a 4-digit year.";
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast({ title: "Check your details", description: err, variant: "destructive" }); return; }
    setBusy(true);
    try {
      // 1. Join tournament (idempotent)
      const join = await supabase.functions.invoke("manage-tournament", {
        body: { action: "join", tournament_id: id },
      });
      if ((join.data as any)?.error) {
        toast({ title: "Registration blocked", description: (join.data as any).error, variant: "destructive" });
        setBusy(false);
        return;
      }
      // 2. Save FIDE/identity details to registration & profile
      const details: any = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        federation: form.federation.trim().toUpperCase().slice(0, 3) || null,
        city: form.city.trim() || null,
        club: form.club.trim() || null,
        fide_id: form.fide_id.trim() || null,
        fide_title: form.fide_title.trim().toUpperCase() || null,
        birth_year: form.birth_year ? Number(form.birth_year) : null,
      };
      const upd = await supabase.functions.invoke("manage-tournament", {
        body: { action: "update_player_details", tournament_id: id, player_details: details },
      });
      if ((upd.data as any)?.error) {
        toast({ title: "Saved partially", description: (upd.data as any).error, variant: "destructive" });
      } else {
        toast({ title: "Registered ✓", description: "Don't forget to check in before the window closes." });
      }
      navigate(`/tournaments/${id}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <Card className="max-w-2xl mx-auto p-6">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">Register · {tournament.name}</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {tournament.time_control_label} · {tournament.total_rounds} rounds · {tournament.format}
          </p>

          {/* FIDE Quick Lookup */}
          <div className="mb-5 rounded-lg border border-primary/30 bg-primary/5 p-3">
            <Label className="text-xs font-bold uppercase tracking-wide text-primary">FIDE Quick Lookup</Label>
            <p className="text-xs text-muted-foreground mt-0.5 mb-2">
              Enter your FIDE ID and we'll fetch your name, federation & title automatically.
            </p>
            <div className="flex gap-2">
              <Input value={form.fide_id} onChange={handle("fide_id")} placeholder="e.g. 14600340" maxLength={10} />
              <Button type="button" onClick={lookupFide} disabled={fideBusy} variant="secondary">
                {fideBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4 mr-1" /> Find me</>}
              </Button>
            </div>
          </div>

          {(form.first_name && form.last_name) && (
            <Button
              type="button"
              className="w-full mb-4 bg-gradient-to-r from-yellow-500 to-amber-400 text-black hover:from-yellow-400 hover:to-amber-300"
              onClick={(e) => submit(e as any)}
              disabled={busy}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Zap className="h-4 w-4 mr-1" /> Register as {form.first_name} {form.last_name}</>}
            </Button>
          )}

          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First name *" value={form.first_name} onChange={handle("first_name")} />
            <Field label="Last name *" value={form.last_name} onChange={handle("last_name")} />
            <Field label="Federation (e.g. SRB)" value={form.federation} onChange={handle("federation")} maxLength={3} />
            <Field label="City" value={form.city} onChange={handle("city")} />
            <Field label="Club" value={form.club} onChange={handle("club")} />
            <Field label="Birth year" value={form.birth_year} onChange={handle("birth_year")} maxLength={4} />
            <Field label="FIDE ID (optional, digits only)" value={form.fide_id} onChange={handle("fide_id")} />
            <Field label="FIDE title (e.g. GM, IM, FM)" value={form.fide_title} onChange={handle("fide_title")} maxLength={3} />
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(`/tournaments/${id}`)}>Cancel</Button>
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register"}
              </Button>
            </div>
          </form>
          <p className="text-xs text-muted-foreground mt-4">
            FIDE Quick Lookup reads your public profile from{" "}
            <a className="underline" href="https://ratings.fide.com/" target="_blank" rel="noreferrer">ratings.fide.com</a>{" "}
            so you don't have to type anything. Used only for official Chess-Results publication.
          </p>
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input {...rest} className="mt-1" />
    </div>
  );
}
