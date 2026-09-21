// Small "Coach" chip shown next to the player's name when they hold
// the official MasterChess Coach recognition.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";

export default function CoachBadge({ userId }: { userId?: string | null }) {
  const [isCoach, setIsCoach] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { count } = await supabase
        .from("user_awards")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("badge", "coach");
      if (!cancelled) setIsCoach((count ?? 0) > 0);
    })();
    return () => { cancelled = true; };
  }, [userId]);

  if (!isCoach) return null;

  return (
    <Badge className="border-primary/40 bg-primary/15 text-primary">
      <GraduationCap className="mr-1 h-3 w-3" /> Coach
    </Badge>
  );
}
