import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, Bell, CheckCircle2, ChevronDown, ChevronUp, Loader2, LogIn, Trophy, UserPlus, Zap } from "lucide-react";
import { usePushSubscription } from "@/hooks/use-push-subscription";

type FormState = {
  first_name: string;
  last_name: string;
  fide_id: string;
  federation: string;
  city: string;
  club: string;
  fide_title: string;
  birth_year: string;
};

const PENDING_KEY = "mc.dbcup.pendingRegistration";
const emptyForm: FormState = {
  first_name: "",
  last_name: "",
  fide_id: "",
  federation: "",
  city: "",
  club: "",
  fide_title: "",
  birth_year: "",
};

function cleanRedirect() {
  return `/dragan-brakus/register${window.location.search || ""}`;
}

function parseFideName(raw: string) {
  if (raw.includes(",")) {
    const [last, first] = raw.split(",").map((s) => s.trim());
    return { first_name: first || "", last_name: last || "" };
  }
  const parts = raw.trim().split(/\s+/).filter(Boolean);
  return {
    first_name: parts.slice(0, -1).join(" ") || parts[0] || "",
    last_name: parts.length > 1 ? parts[parts.length - 1] : "",
  };
}

export default function DraganBrakusRegister() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [fideBusy, setFideBusy] = useState(false);
  const [fideFound, setFideFound] = useState<null | { name: string; federation?: string; rating?: number }>(null);
  const [fideError, setFideError] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);

  const handle = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = key === "fide_id" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value;
    setForm((s) => ({ ...s, [key]: value }));
  };

  const lookupFide = async (idArg?: string) => {
    const fid = (idArg ?? form.fide_id).trim();
    if (!/^\d{4,10}$/.test(fid)) {
      setFideError("FIDE ID must be 4–10 digits.");
      return;
    }
    setFideBusy(true);
    setFideError(null);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 3000);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fide-lookup?id=${fid}`;
      const r = await fetch(url, {
        headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        signal: controller.signal,
      });
      const json: any = await r.json().catch(() => ({}));
      if (!json?.name) {
        setFideFound(null);
        setFideError(json?.error || "FIDE profile not found. You can still type your name manually.");
        return;
      }
      const parsed = parseFideName(String(json.name));
      setForm((s) => ({
        ...s,
        first_name: parsed.first_name || s.first_name,
        last_name: parsed.last_name || s.last_name,
        federation: (json.federation || s.federation || "").toUpperCase().slice(0, 3),
        fide_title: (json.title || s.fide_title || "").toUpperCase().slice(0, 3),
        birth_year: json.birth_year ? String(json.birth_year) : s.birth_year,
      }));
      setFideFound({ name: String(json.name), federation: json.federation, rating: json.rating });
    } catch (e: any) {
      setFideFound(null);
      setFideError(e?.name === "AbortError" ? "FIDE lookup timed out. Type your name manually." : (e?.message || "Lookup failed."));
    } finally {
      window.clearTimeout(timer);
      setFideBusy(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    const fid = form.fide_id.trim();
    if (!/^\d{5,10}$/.test(fid)) {
      setFideFound(null);
      setFideError(null);
      return;
    }
    debounceRef.current = window.setTimeout(() => lookupFide(fid), 450);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.fide_id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pending = localStorage.getItem(PENDING_KEY);
        if (pending) setForm((s) => ({ ...s, ...JSON.parse(pending) }));
      } catch {}

      const { data } = await supabase
        .from("tournaments")
        .select("*")
        .or("name.ilike.%Dragan Brakus%,name.ilike.%DB Chess Cup%")
        .order("starts_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled) {
        setTournament(data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const [{ data: profile }, { data: priv }] = await Promise.all([
        supabase
          .from("profiles")
          .select("federation, country, club, fide_id, fide_title, city")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase.rpc("get_my_private_profile"),
      ]);
      const p: any = Array.isArray(priv) ? priv[0] : priv;
      setForm((s) => ({
        ...s,
        first_name: s.first_name || p?.first_name || "",
        last_name: s.last_name || p?.last_name || "",
        federation: s.federation || (profile?.federation || profile?.country || "").toUpperCase(),
        city: s.city || profile?.city || "",
        club: s.club || profile?.club || "",
        fide_id: s.fide_id || profile?.fide_id || "",
        fide_title: s.fide_title || profile?.fide_title || "",
        birth_year: s.birth_year || (p?.birth_year ? String(p.birth_year) : ""),
      }));
    })();
  }, [user?.id]);

  const validate = () => {
    if (!form.first_name.trim()) return "First name is required.";
    if (!form.last_name.trim()) return "Last name is required.";
    if (form.fide_id && !/^\d{4,10}$/.test(form.fide_id.trim())) return "FIDE ID must be 4–10 digits.";
    if (form.birth_year && !/^\d{4}$/.test(form.birth_year.trim())) return "Birth year must be 4 digits.";
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast({ title: "Check your details", description: err, variant: "destructive" });
      return;
    }
    if (!user) {
      try { localStorage.setItem(PENDING_KEY, JSON.stringify(form)); } catch {}
      navigate(`/login?redirect=${encodeURIComponent(cleanRedirect())}`);
      return;
    }
    if (!tournament?.id) {
      toast({ title: "Tournament not found", description: "Please try again in a moment.", variant: "destructive" });
      return;
    }

    setBusy(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const inviteFromUrl = params.get("invite") || "";
      const inviteFromStore = (() => { try { return sessionStorage.getItem("db_cup_invite_code") || ""; } catch { return ""; } })();
      const invite_code = (inviteFromUrl || inviteFromStore || "").trim().toUpperCase() || null;
      const player_details = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        fide_id: form.fide_id.trim() || null,
        federation: form.federation.trim().toUpperCase().slice(0, 3) || null,
        city: form.city.trim() || null,
        club: form.club.trim() || null,
        fide_title: form.fide_title.trim().toUpperCase().slice(0, 3) || null,
        birth_year: form.birth_year ? Number(form.birth_year) : null,
      };
      const { data, error } = await supabase.functions.invoke("db-cup-register", {
        body: { tournament_id: tournament.id, invite_code, player_details },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      try {
        localStorage.removeItem(PENDING_KEY);
        sessionStorage.removeItem("db_cup_invite_code");
      } catch {}
      toast({ title: "Registered ✓", description: "You are now on the DB Chess Cup standings list." });
      navigate("/dragan-brakus/live?registered=1");
    } catch (e: any) {
      toast({ title: "Registration failed", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const title = tournament?.name || "DB Chess Cup";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Register — DB Chess Cup on MasterChess"
        description="Register for the DB Chess Cup. FIDE ID is optional — type your name and appear on the live standings list."
        path="/dragan-brakus/register"
      />
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <Card className="overflow-hidden border-amber-300/30 bg-gradient-to-br from-zinc-950 via-card to-background">
          <div className="border-b border-amber-300/20 bg-amber-400/10 p-5 sm:p-7">
            <Badge className="mb-3 border-amber-300/40 bg-amber-400/20 text-amber-200">Registration open</Badge>
            <h1 className="text-3xl font-black sm:text-4xl">Register for {title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              2 July 2026 · 17:00 CEST · FIDE ID optional. If you have FIDE ID, we auto-fill your public name; if not, type your name manually.
            </p>
          </div>

          <div className="p-5 sm:p-7">
            {(authLoading || loading) ? (
              <div className="grid min-h-48 place-items-center">
                <Loader2 className="h-7 w-7 animate-spin text-amber-300" />
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                {!user && (
                  <div className="rounded-xl border border-sky-400/30 bg-sky-400/10 p-4 text-sm text-sky-100">
                    Fill the form now. On submit, you will sign in/create an account so MasterChess can send tournament email and notifications.
                  </div>
                )}

                <div className="rounded-xl border border-amber-300/25 bg-amber-400/5 p-4">
                  <Label className="text-xs font-bold uppercase tracking-widest text-amber-300">FIDE Quick Lookup (optional)</Label>
                  <div className="relative mt-2">
                    <Input value={form.fide_id} onChange={handle("fide_id")} placeholder="e.g. 9218275" inputMode="numeric" maxLength={10} className="pr-10" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {fideBusy && <Loader2 className="h-4 w-4 animate-spin text-amber-300" />}
                      {!fideBusy && fideFound && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                      {!fideBusy && fideError && form.fide_id.length >= 5 && <AlertCircle className="h-4 w-4 text-orange-400" />}
                    </div>
                  </div>
                  {fideFound && <p className="mt-2 text-xs text-emerald-300">Found: <b>{fideFound.name}</b>{fideFound.federation ? ` · ${fideFound.federation}` : ""}{fideFound.rating ? ` · ${fideFound.rating}` : ""}</p>}
                  {fideError && form.fide_id.length >= 5 && <p className="mt-2 text-xs text-orange-300">{fideError}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First name *" value={form.first_name} onChange={handle("first_name")} autoComplete="given-name" />
                  <Field label="Last name *" value={form.last_name} onChange={handle("last_name")} autoComplete="family-name" />
                  <Field label="Federation" value={form.federation} onChange={handle("federation")} placeholder="SRB" maxLength={3} />
                  <Field label="FIDE title" value={form.fide_title} onChange={handle("fide_title")} placeholder="GM / IM / FM" maxLength={3} />
                  <Field label="City" value={form.city} onChange={handle("city")} />
                  <Field label="Club" value={form.club} onChange={handle("club")} />
                  <Field label="Birth year" value={form.birth_year} onChange={handle("birth_year")} inputMode="numeric" maxLength={4} />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="submit" size="lg" disabled={busy || !tournament?.id} className="bg-amber-400 text-black hover:bg-amber-300">
                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                    {user ? "Register Now" : "Continue & Register"}
                  </Button>
                  <div className="flex gap-2">
                    {!user && (
                      <>
                        <Button asChild type="button" variant="outline"><Link to={`/login?redirect=${encodeURIComponent(cleanRedirect())}`}><LogIn className="mr-2 h-4 w-4" />Login</Link></Button>
                        <Button asChild type="button" variant="secondary"><Link to={`/signup?redirect=${encodeURIComponent(cleanRedirect())}`}><UserPlus className="mr-2 h-4 w-4" />Sign up</Link></Button>
                      </>
                    )}
                    <Button asChild type="button" variant="ghost"><Link to="/dragan-brakus/live">Standings</Link></Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input {...rest} className="mt-1" />
    </div>
  );
}
