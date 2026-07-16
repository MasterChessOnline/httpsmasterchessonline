import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function ClubIdRedirect() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  useEffect(() => {
    (async () => {
      if (!id) return nav("/clubs", { replace: true });
      const { data } = await supabase.from("clubs").select("slug").eq("id", id).maybeSingle();
      if (data?.slug) nav(`/club/${data.slug}`, { replace: true });
      else nav("/clubs", { replace: true });
    })();
  }, [id, nav]);
  return <div className="min-h-screen flex items-center justify-center text-neutral-400">Preusmeravam…</div>;
}
