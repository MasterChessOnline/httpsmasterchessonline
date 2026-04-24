import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DailyMission {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  mission_type: string;
  target_value: number;
  xp_reward: number;
  sort_order: number;
}

export interface MissionProgress {
  mission_key: string;
  current_value: number;
  completed: boolean;
  claimed: boolean;
}

export interface MissionWithProgress extends DailyMission {
  current_value: number;
  completed: boolean;
  claimed: boolean;
  percent: number;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export function useDailyMissions() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<MissionWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setMissions([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: defs } = await supabase
      .from("daily_missions" as any)
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    const { data: progress } = await supabase
      .from("user_mission_progress" as any)
      .select("mission_key, current_value, completed, claimed")
      .eq("user_id", user.id)
      .eq("mission_date", todayIso());

    const progressMap = new Map<string, MissionProgress>();
    ((progress as any[]) || []).forEach((p) => progressMap.set(p.mission_key, p));

    const merged: MissionWithProgress[] = ((defs as any[]) || []).map((m) => {
      const p = progressMap.get(m.key);
      const cur = p?.current_value ?? 0;
      return {
        ...m,
        current_value: cur,
        completed: p?.completed ?? false,
        claimed: p?.claimed ?? false,
        percent: Math.min(100, Math.round((cur / Math.max(1, m.target_value)) * 100)),
      };
    });

    setMissions(merged);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const claimMission = useCallback(
    async (missionKey: string): Promise<boolean> => {
      if (!user) return false;
      const m = missions.find((x) => x.key === missionKey);
      if (!m || !m.completed || m.claimed) return false;

      const { error } = await supabase
        .from("user_mission_progress" as any)
        .update({
          claimed: true,
          claimed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("mission_key", missionKey)
        .eq("mission_date", todayIso());

      if (error) {
        console.error("Claim failed", error);
        return false;
      }
      await refresh();
      return true;
    },
    [user, missions, refresh]
  );

  const completedCount = missions.filter((m) => m.completed).length;
  const claimedCount = missions.filter((m) => m.claimed).length;
  const totalXp = missions.reduce(
    (acc, m) => acc + (m.claimed ? m.xp_reward : 0),
    0
  );
  const claimableXp = missions.reduce(
    (acc, m) => acc + (m.completed && !m.claimed ? m.xp_reward : 0),
    0
  );

  return {
    missions,
    loading,
    refresh,
    claimMission,
    completedCount,
    claimedCount,
    totalCount: missions.length,
    totalXp,
    claimableXp,
  };
}

/**
 * Increment mission progress for the current user.
 * Used by gameplay/lesson hooks to bump counters.
 */
export async function bumpMissionProgress(
  userId: string,
  missionType: string,
  amount = 1,
  setAbsolute?: number
) {
  if (!userId) return;
  const date = todayIso();

  // Find active missions matching this type
  const { data: defs } = await supabase
    .from("daily_missions" as any)
    .select("key, target_value, mission_type")
    .eq("is_active", true)
    .eq("mission_type", missionType);

  if (!defs || defs.length === 0) return;

  for (const def of defs as any[]) {
    // Read current row
    const { data: existing } = await supabase
      .from("user_mission_progress" as any)
      .select("id, current_value, completed")
      .eq("user_id", userId)
      .eq("mission_key", def.key)
      .eq("mission_date", date)
      .maybeSingle();

    const baseValue = (existing as any)?.current_value ?? 0;
    const newValue =
      setAbsolute !== undefined ? setAbsolute : baseValue + amount;
    const completed = newValue >= def.target_value;

    if (existing) {
      if ((existing as any).completed) continue;
      await supabase
        .from("user_mission_progress" as any)
        .update({
          current_value: newValue,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq("id", (existing as any).id);
    } else {
      await supabase.from("user_mission_progress" as any).insert({
        user_id: userId,
        mission_key: def.key,
        mission_date: date,
        current_value: newValue,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      });
    }
  }
}
