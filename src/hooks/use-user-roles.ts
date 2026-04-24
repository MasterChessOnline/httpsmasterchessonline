import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "admin" | "organizer" | "moderator" | "user";

export function useUserRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!user) { setRoles([]); setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (active) {
        setRoles((data || []).map(r => r.role as AppRole));
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user]);

  const isAdmin = roles.includes("admin");
  const isOrganizer = roles.includes("organizer");
  const canManageTournaments = isAdmin || isOrganizer;

  return { roles, isAdmin, isOrganizer, canManageTournaments, loading };
}
