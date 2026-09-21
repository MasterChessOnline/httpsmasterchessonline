// Small "MasterChess Verified" chip shown next to a player's name when they
// hold the official MasterChess Verified recognition.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

export default function PlayerVerifiedBadge({ userId }: { userId?: string | null }) {
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { count } = await supabase
        .from("user_awards")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("badge", "verified");
      if (!cancelled) setIsVerified((count ?? 0) > 0);
    })();
    return () => { cancelled = true; };
  }, [userId]);

  if (!isVerified) return null;

  return (
    <Badge className="border-primary/40 bg-primary/15 text-primary">
      <ShieldCheck className="mr-1 h-3 w-3" /> MasterChess Verified
    </Badge>
  );
}
