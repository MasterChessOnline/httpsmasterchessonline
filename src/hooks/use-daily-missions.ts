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
  difficulty: "easy" | "medium" | "hard" | "elite";
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

    // Today's rotated set (one mission per difficulty tier, rotates daily)
    const { data: defs } = await supabase.rpc("get_today_missions" as any);

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
    async (
      missionKey: string,
    ): Promise<{ ok: boolean; xp?: number; total?: number; newBadges?: string[] }> => {
      if (!user) return { ok: false };
      const m = missions.find((x) => x.key === missionKey);
      if (!m || !m.completed || m.claimed) return { ok: false };

      const { data, error } = await supabase.rpc("claim_daily_mission" as any, {
        p_key: missionKey,
      });

      if (error || !(data as any)?.ok) {
        console.error("Claim failed", error ?? data);
        return { ok: false };
      }
      await refresh();
      const xp = (data as any).xp_awarded as number | undefined;
      const newBadges = (data as any).new_badges ?? [];
      if (xp) {
        const { emitReward } = await import("@/lib/reward-fx");
        emitReward({
          kind: "xp",
          title: m.title || "Mission complete",
          subtitle: "Daily mission claimed",
          amount: xp,
        });
        for (const b of newBadges) {
          emitReward({
            kind: "achievement",
            title: `New badge: ${b}`,
            subtitle: "Unlocked from missions",
            rare: true,
          });
        }
      }
      return {
        ok: true,
        xp,
        total: (data as any).total_xp,
        newBadges,
      };
    },
    [user, missions, refresh],
  );

  const completedCount = missions.filter((m) => m.completed).length;
  const claimedCount = missions.filter((m) => m.claimed).length;
  const xpClaimedToday = missions.reduce(
    (acc, m) => acc + (m.claimed ? m.xp_reward : 0),
    0,
  );
  const claimableXp = missions.reduce(
    (acc, m) => acc + (m.completed && !m.claimed ? m.xp_reward : 0),
    0,
  );

  return {
    missions,
    loading,
    refresh,
    claimMission,
    completedCount,
    claimedCount,
    totalCount: missions.length,
    xpClaimedToday,
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
  // Server-validated bump — clients cannot self-mark missions complete.
  await supabase.rpc("bump_mission_progress" as any, {
    p_mission_type: missionType,
    p_amount: amount,
    p_set_absolute: setAbsolute ?? null,
  });
}
