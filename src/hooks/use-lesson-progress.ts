import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { bumpMissionProgress } from "@/hooks/use-daily-missions";

interface LessonProgressRecord {
  lesson_id: string;
  course_id: string;
  completed: boolean;
  completed_at: string | null;
  score: number;
}

interface LearningStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_lessons_completed: number;
}

interface BookmarkRecord {
  lesson_id: string;
  course_id: string;
}

export function useLessonProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Map<string, LessonProgressRecord>>(new Map());
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [bookmarkData, setBookmarkData] = useState<BookmarkRecord[]>([]);
  const [streak, setStreak] = useState<LearningStreak>({
    current_streak: 0,
    longest_streak: 0,
    last_activity_date: null,
    total_lessons_completed: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch all data on mount
  useEffect(() => {
    if (!user) {
      setProgress(new Map());
      setBookmarks(new Set());
      setBookmarkData([]);
      setStreak({ current_streak: 0, longest_streak: 0, last_activity_date: null, total_lessons_completed: 0 });
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      const [progressRes, bookmarksRes, streakRes] = await Promise.all([
        supabase.from("lesson_progress").select("*").eq("user_id", user.id),
        supabase.from("lesson_bookmarks").select("*").eq("user_id", user.id),
        supabase.from("learning_streaks").select("*").eq("user_id", user.id).maybeSingle(),
      ]);

      if (progressRes.data) {
        const map = new Map<string, LessonProgressRecord>();
        for (const row of progressRes.data) {
          map.set(row.lesson_id, {
            lesson_id: row.lesson_id,
            course_id: row.course_id,
            completed: row.completed,
            completed_at: row.completed_at,
            score: row.score ?? 0,
          });
        }
        setProgress(map);
      }

      if (bookmarksRes.data) {
        setBookmarks(new Set(bookmarksRes.data.map((b: any) => b.lesson_id)));
        setBookmarkData(bookmarksRes.data.map((b: any) => ({ lesson_id: b.lesson_id, course_id: b.course_id })));
      }

      if (streakRes.data) {
        setStreak({
          current_streak: streakRes.data.current_streak,
          longest_streak: streakRes.data.longest_streak,
          last_activity_date: streakRes.data.last_activity_date,
          total_lessons_completed: streakRes.data.total_lessons_completed,
        });
      }

      setLoading(false);
    };

    fetchAll();
  }, [user]);

  const markComplete = useCallback(async (courseId: string, lessonId: string, score?: number) => {
    if (!user) return;

    const now = new Date().toISOString();
    const today = new Date().toISOString().split("T")[0];

    // Upsert lesson progress
    await supabase.from("lesson_progress").upsert({
      user_id: user.id,
      course_id: courseId,
      lesson_id: lessonId,
      completed: true,
      completed_at: now,
      score: score ?? 100,
    }, { onConflict: "user_id,lesson_id" });

    // Daily missions: lesson visit/completion
    try {
      await bumpMissionProgress(user.id, "lesson_visited", 1);
    } catch (err) {
      console.warn("Mission bump (lesson) failed", err);
    }

    // Update local state
    setProgress(prev => {
      const next = new Map(prev);
      next.set(lessonId, { lesson_id: lessonId, course_id: courseId, completed: true, completed_at: now, score: score ?? 100 });
      return next;
    });

    // Update streak
    const lastDate = streak.last_activity_date;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    let newCurrent = streak.current_streak;
    if (lastDate === today) {
      // Already active today, no streak change
    } else if (lastDate === yesterday) {
      newCurrent += 1;
    } else {
      newCurrent = 1;
    }
    const newLongest = Math.max(streak.longest_streak, newCurrent);
    const newTotal = streak.total_lessons_completed + (progress.get(lessonId)?.completed ? 0 : 1);

    await supabase.from("learning_streaks").upsert({
      user_id: user.id,
      current_streak: newCurrent,
      longest_streak: newLongest,
      last_activity_date: today,
      total_lessons_completed: newTotal,
      updated_at: now,
    }, { onConflict: "user_id" });

    setStreak({
      current_streak: newCurrent,
      longest_streak: newLongest,
      last_activity_date: today,
      total_lessons_completed: newTotal,
    });
  }, [user, streak, progress]);

  const toggleBookmark = useCallback(async (courseId: string, lessonId: string) => {
    if (!user) return;

    if (bookmarks.has(lessonId)) {
      await supabase.from("lesson_bookmarks").delete().eq("user_id", user.id).eq("lesson_id", lessonId);
      setBookmarks(prev => { const next = new Set(prev); next.delete(lessonId); return next; });
      setBookmarkData(prev => prev.filter(b => b.lesson_id !== lessonId));
    } else {
      await supabase.from("lesson_bookmarks").insert({ user_id: user.id, course_id: courseId, lesson_id: lessonId });
      setBookmarks(prev => new Set(prev).add(lessonId));
      setBookmarkData(prev => [...prev, { lesson_id: lessonId, course_id: courseId }]);
    }
  }, [user, bookmarks]);

  const isCompleted = useCallback((lessonId: string) => progress.get(lessonId)?.completed ?? false, [progress]);
  const isBookmarked = useCallback((lessonId: string) => bookmarks.has(lessonId), [bookmarks]);

  const getCourseProgress = useCallback((courseId: string, totalLessons: number) => {
    let completed = 0;
    progress.forEach((p) => { if (p.course_id === courseId && p.completed) completed++; });
    return { completed, total: totalLessons, percent: totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0 };
  }, [progress]);

  return {
    progress, bookmarks: bookmarkData, streak, loading,
    markComplete, toggleBookmark, isCompleted, isBookmarked, getCourseProgress,
  };
}
