import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";

type App = {
  id: string;
  partner_type: string;
  organization_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  city: string | null;
  country: string | null;
  member_count: number | null;
  website_url: string | null;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  club_id: string | null;
};

export default function AdminPartners() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    })();
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      let q = supabase
        .from("partner_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) return toast.error(error.message);
      setApps((data ?? []) as App[]);
    })();
  }, [isAdmin, filter]);

  const decide = async (app: App, approve: boolean) => {
    setBusy(app.id);
    let clubId = app.club_id;

    if (approve && app.partner_type === "club" && !clubId) {
      // Create a stub verified club
      const slugBase = app.organization_name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40) || "klub";
      const slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;

      const { data: created, error: cErr } = await supabase
        .from("clubs")
        .insert({
          name: app.organization_name,
          description: app.message ?? "",
          owner_id: user!.id,
          slug,
          verified: true,
          partner_type: "club",
          city: app.city,
          website_url: app.website_url,
          contact_email: app.contact_email,
        })
        .select("id")
        .single();
      if (cErr) {
        setBusy(null);
        return toast.error(`Kreiranje kluba: ${cErr.message}`);
      }
      clubId = created!.id;
    }

    const { error } = await supabase
      .from("partner_applications")
      .update({
        status: approve ? "approved" : "rejected",
        reviewer_id: user!.id,
        decided_at: new Date().toISOString(),
        club_id: clubId,
      })
      .eq("id", app.id);
    setBusy(null);
    if (error) return toast.error(error.message);
    setApps((prev) => prev.filter((a) => a.id !== app.id || filter === "all"));
    toast.success(approve ? "Odobreno" : "Odbijeno");
  };

  if (isAdmin === null) return <div className="min-h-screen flex items-center justify-center text-neutral-400">Učitavanje…</div>;
  if (!isAdmin)
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-400">
        Samo admin.
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Partner prijave</h1>
        <div className="flex gap-2 mb-6">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>

        {apps.length === 0 ? (
          <p className="text-neutral-500">Nema prijava.</p>
        ) : (
          <div className="space-y-4">
            {apps.map((a) => (
              <Card key={a.id} className="p-5 bg-neutral-950 border-neutral-900">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div className="flex-1 min-w-[220px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl font-bold">{a.organization_name}</span>
                      <Badge variant="outline">{a.partner_type}</Badge>
                      <Badge
                        className={
                          a.status === "approved"
                            ? "bg-green-500/20 text-green-300"
                            : a.status === "rejected"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-amber-500/20 text-amber-300"
                        }
                      >
                        {a.status === "pending" && <Clock size={12} className="mr-1" />}
                        {a.status === "approved" && <CheckCircle2 size={12} className="mr-1" />}
                        {a.status === "rejected" && <XCircle size={12} className="mr-1" />}
                        {a.status}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-neutral-300 space-y-1">
                      <div>
                        <b>{a.contact_name}</b> ·{" "}
                        <a href={`mailto:${a.contact_email}`} className="text-amber-400 hover:underline">
                          {a.contact_email}
                        </a>
                        {a.contact_phone && ` · ${a.contact_phone}`}
                      </div>
                      <div className="text-neutral-400">
                        {[a.city, a.country].filter(Boolean).join(", ")}
                        {a.member_count ? ` · ${a.member_count} članova` : ""}
                      </div>
                      {a.website_url && (
                        <a
                          href={a.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline"
                        >
                          <ExternalLink size={12} /> {a.website_url}
                        </a>
                      )}
                      {a.message && (
                        <p className="mt-2 whitespace-pre-line text-neutral-300 bg-neutral-900/50 p-3 rounded">
                          {a.message}
                        </p>
                      )}
                      <div className="text-xs text-neutral-500 mt-2">
                        {new Date(a.created_at).toLocaleString("sr-RS")}
                      </div>
                    </div>
                  </div>
                  {a.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => decide(a, true)}
                        disabled={busy === a.id}
                        className="bg-green-600 hover:bg-green-500"
                      >
                        Odobri
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => decide(a, false)}
                        disabled={busy === a.id}
                      >
                        Odbij
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
