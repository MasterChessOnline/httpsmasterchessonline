import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StoryProgressEntry {
  chapter_key: string;
  completed: boolean;
  stars: number;
  completed_at: string | null;
}

export function useStoryProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<Record<string, StoryProgressEntry>>({});
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    if (!userId) { setLoading(false); return; }
    const { data } = await supabase
      .from("story_progress" as any)
      .select("chapter_key, completed, stars, completed_at")
      .eq("user_id", userId);

    if (data) {
      const map: Record<string, StoryProgressEntry> = {};
      (data as any[]).forEach(d => { map[d.chapter_key] = d as StoryProgressEntry; });
      setProgress(map);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProgress(); }, [userId]);

  const markCompleted = async (chapterKey: string, stars: number) => {
    if (!userId) return;
    const existing = progress[chapterKey];
    if (existing?.completed) return; // already done

    await supabase
      .from("story_progress" as any)
      .upsert({
        user_id: userId,
        chapter_key: chapterKey,
        completed: true,
        stars: Math.max(stars, existing?.stars || 0),
        completed_at: new Date().toISOString(),
      } as any, { onConflict: "user_id,chapter_key" });

    await fetchProgress();
  };

  const completedCount = Object.values(progress).filter(p => p.completed).length;
  const totalStars = Object.values(progress).reduce((sum, p) => sum + p.stars, 0);

  return { progress, loading, markCompleted, completedCount, totalStars, refetch: fetchProgress };
}
