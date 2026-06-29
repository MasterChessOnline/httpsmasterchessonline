// Resolves the DB Chess Cup tournament id and forwards to the standard
// /tournaments/:id/register page. Avoids hard-coding the UUID in the banner.
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function DraganBrakusRegister() {
  const [target, setTarget] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("id")
        .or("name.ilike.%Dragan Brakus%,name.ilike.%DB Chess Cup%")
        .order("starts_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error || !data) { setErr("Tournament not found"); return; }
      setTarget(`/tournaments/${data.id}/register`);
    })();
  }, []);

  if (err) return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">{err}</div>;
  if (!target) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  return <Navigate to={target} replace />;
}
