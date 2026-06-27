import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * /dragan-brakus — friendly slug for the Dragan Brakus Humanitarian Blitz.
 * Looks up the seeded tournament by name and redirects to its lobby.
 */
export default function DraganBrakusRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("tournaments")
        .select("id")
        .eq("name", "Dragan Brakus Humanitarian Blitz")
        .order("starts_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      navigate(data?.id ? `/tournaments/${data.id}` : "/tournaments", { replace: true });
    })();
  }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
