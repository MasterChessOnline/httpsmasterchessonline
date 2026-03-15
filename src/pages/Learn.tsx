import { useState, useCallback, useMemo } from "react";
import { Chess, Square } from "chess.js";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Target, Crown, Layout, Crosshair, Brain,
  ArrowLeft, ChevronRight, CheckCircle2, Lock, Star,
  Bookmark, BookmarkCheck, Flame, Trophy, BarChart3,
  Play, Video, Sparkles, Lightbulb, ChevronDown, ChevronUp,
} from "lucide-react";
import { COURSES, Course, Lesson } from "@/lib/courses-data";
import { useAuth } from "@/contexts/AuthContext";
import { hasAccess } from "@/lib/premium-tiers";
import InteractiveBoard from "@/components/learn/InteractiveBoard";
import { LESSON_MOVES, LessonVariation } from "@/lib/lesson-moves";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { toast } from "@/hooks/use-toast";

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen, Target, Crown, Layout, Crosshair, Brain,
};

/* ──── YouTube Embed ──── */
function YouTubeEmbed({ videoUrl, title }: { videoUrl: string; title: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border/50">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={videoUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

/* ──── Streak Banner ──── */
function StreakBanner({ streak }: { streak: { current_streak: number; longest_streak: number; total_lessons_completed: number } }) {
  return (
    <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8">
      {[
        { icon: Flame, label: "Daily Streak", value: `${streak.current_streak} day${streak.current_streak !== 1 ? "s" : ""}`, color: "text-orange-500" },
        { icon: Trophy, label: "Best Streak", value: `${streak.longest_streak} day${streak.longest_streak !== 1 ? "s" : ""}`, color: "text-primary" },
        { icon: BarChart3, label: "Completed", value: `${streak.total_lessons_completed} lesson${streak.total_lessons_completed !== 1 ? "s" : ""}`, color: "text-green-500" },
      ].map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border/30">
          <Icon className={`w-5 h-5 ${color}`} />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-base font-bold text-foreground font-mono">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──── Bookmarked Lessons ──── */
function BookmarkedPanel({
  bookmarks,
  onGoToLesson,
}: {
  bookmarks: { lesson_id: string; course_id: string }[];
  onGoToLesson: (courseId: string, lessonId: string) => void;
}) {
  if (bookmarks.length === 0) return null;
  return (
    <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <BookmarkCheck className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm font-semibold text-foreground">Continue Where You Left Off</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {bookmarks.slice(0, 8).map((b) => {
          const course = COURSES.find((c) => c.id === b.course_id);
          const lesson = course?.lessons.find((l) => l.id === b.lesson_id);
          if (!course || !lesson) return null;
          return (
            <button
              key={b.lesson_id}
              onClick={() => onGoToLesson(b.course_id, b.lesson_id)}
              className="text-xs px-3 py-1.5 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-colors text-left"
            >
              <span className="text-muted-foreground">{course.title} → </span>
              <span className="text-foreground font-medium">{lesson.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ──── AI Feedback Panel ──── */
function AIFeedbackPanel({ lesson, isPremium }: { lesson: Lesson; isPremium: boolean }) {
  const [expanded, setExpanded] = useState(false);

  // Generate contextual AI feedback based on lesson content
  const feedback = useMemo(() => {
    const tips = [
      `In "${lesson.title}", focus on ${lesson.keyPoints[0]?.toLowerCase() || "the key concepts"}.`,
      `DailyChess_12 recommends practicing this position 3 times to build muscle memory.`,
      `Common mistake: ignoring ${lesson.keyPoints[1]?.toLowerCase() || "positional factors"}. Watch for this in your games.`,
    ];
    const suggestedMoves = lesson.practiceLine?.moves?.slice(0, 2).map(m => m.move) || ["e4", "d4"];
    return { tips, suggestedMoves };
  }, [lesson]);

  if (!isPremium) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10 pointer-events-none" />
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h4 className="font-display text-sm font-semibold text-foreground">AI Feedback Preview</h4>
          <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] ml-auto">
            <Crown className="w-2.5 h-2.5 mr-0.5" /> Premium
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{feedback.tips[0]}</p>
        <div className="blur-sm select-none pointer-events-none">
          <p className="text-xs text-muted-foreground">{feedback.tips[1]}</p>
          <p className="text-xs text-muted-foreground mt-1">Suggested: {feedback.suggestedMoves.join(", ")}</p>
        </div>
        <Button
          size="sm"
          className="mt-3 relative z-10"
          onClick={() => window.location.href = "/premium"}
        >
          <Crown className="w-3.5 h-3.5 mr-1.5" /> Unlock Full AI Feedback
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h4 className="font-display text-sm font-semibold text-foreground">DailyChess_12 AI Feedback</h4>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {expanded && (
        <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {feedback.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>{tip}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-muted/30 border border-border/30">
            <Target className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">Suggested moves:</span>
            <span className="font-mono font-bold text-foreground">{feedback.suggestedMoves.join(", ")}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──── Course List ──── */
function CourseList({
  onSelectCourse,
  getCourseProgress,
}: {
  onSelectCourse: (course: Course) => void;
  getCourseProgress: (courseId: string, total: number) => { completed: number; total: number; percent: number };
}) {
  const { isPremium, subscriptionTier } = useAuth();
  const navigate = useNavigate();
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const levels = ["all", "Beginner", "Intermediate", "Advanced"];
  const filtered = levelFilter === "all" ? COURSES : COURSES.filter((c) => c.level === levelFilter);

  const canAccessCourse = (course: Course) => {
    if (course.level === "Beginner") return true;
    if (course.level === "Intermediate") return hasAccess(subscriptionTier, "premium");
    if (course.level === "Advanced") return hasAccess(subscriptionTier, "pro");
    return true;
  };

  return (
    <>
      {/* Tier info */}
      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        {!isPremium && (
          <Badge className="bg-muted text-muted-foreground border-border">
            Free: Beginner courses · 2 preview lessons per premium course
          </Badge>
        )}
        {isPremium && !hasAccess(subscriptionTier, "pro") && (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <Crown className="w-3 h-3 mr-1" /> Premium — Beginner & Intermediate courses
          </Badge>
        )}
        {hasAccess(subscriptionTier, "pro") && (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Star className="w-3 h-3 mr-1" /> Pro — All courses unlocked
          </Badge>
        )}
      </div>

      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {levels.map((lvl) => (
          <button
            key={lvl}
            onClick={() => setLevelFilter(lvl)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all border ${
              levelFilter === lvl
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30"
            }`}
          >
            {lvl === "all" ? "All Levels" : lvl}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => {
          const Icon = ICON_MAP[course.icon] || BookOpen;
          const accessible = canAccessCourse(course);
          const prog = getCourseProgress(course.id, course.lessons.length);

          return (
            <article
              key={course.id}
              className={`group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-glow cursor-pointer relative ${!accessible ? "opacity-70" : ""}`}
              onClick={() => accessible ? onSelectCourse(course) : navigate("/premium")}
            >
              {!accessible && (
                <div className="absolute top-3 right-3">
                  <Badge className={`text-[10px] ${course.level === "Advanced" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-primary/20 text-primary border-primary/30"}`}>
                    <Lock className="w-2.5 h-2.5 mr-0.5" /> {course.level === "Advanced" ? "Pro" : "Premium"}
                  </Badge>
                </div>
              )}
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-lg font-semibold text-foreground">{course.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{course.description}</p>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>{prog.completed}/{prog.total} chapters</span>
                  <span>{prog.percent}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${prog.percent}%` }} />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary font-medium">{course.level}</span>
                <span>{course.lessons.length} chapters</span>
              </div>
              <Button className="mt-4 w-full" size="sm" variant={accessible ? "default" : "outline"}>
                {accessible ? (
                  prog.completed > 0 ? (
                    <>{prog.percent === 100 ? "Review Course" : "Continue Learning"} <ChevronRight className="ml-1 h-4 w-4" /></>
                  ) : (
                    <>Start Course <ChevronRight className="ml-1 h-4 w-4" /></>
                  )
                ) : (
                  <>
                    <Lock className="mr-1 h-3.5 w-3.5" /> Unlock with {course.level === "Advanced" ? "Pro" : "Premium"}
                  </>
                )}
              </Button>
            </article>
          );
        })}
      </div>

      {!isPremium && (
        <div className="mt-10 max-w-lg mx-auto rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
          <Crown className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-display text-lg font-bold text-foreground mb-2">Unlock Premium Learning</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get unlimited course access, AI feedback, video lessons, and personalized training.
          </p>
          <Button onClick={() => navigate("/premium")} className="bg-primary text-primary-foreground">
            View Plans — from $4.99/mo
          </Button>
        </div>
      )}
    </>
  );
}

/* ──── DailyChess_12 Video Map ──── */
const LESSON_VIDEOS: Record<string, string> = {
  "of-1": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "of-2": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "of-3": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "of-4": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "of-5": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "tp-1": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "tp-2": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "tp-3": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "tp-4": "https://www.youtube.com/embed/dQw4w9WgXcQ",
};

/* ──── Course Detail with sequential unlock ──── */
function CourseDetail({
  course,
  onBack,
  onSelectLesson,
  isCompleted,
  isBookmarked,
  getCourseProgress,
}: {
  course: Course;
  onBack: () => void;
  onSelectLesson: (idx: number) => void;
  isCompleted: (id: string) => boolean;
  isBookmarked: (id: string) => boolean;
  getCourseProgress: (courseId: string, total: number) => { completed: number; total: number; percent: number };
}) {
  const { isPremium, subscriptionTier } = useAuth();
  const navigate = useNavigate();
  const Icon = ICON_MAP[course.icon] || BookOpen;
  const prog = getCourseProgress(course.id, course.lessons.length);

  const canAccessCourse = (() => {
    if (course.level === "Beginner") return true;
    if (course.level === "Intermediate") return hasAccess(subscriptionTier, "premium");
    if (course.level === "Advanced") return hasAccess(subscriptionTier, "pro");
    return true;
  })();

  // Sequential unlock: must complete previous to access next
  // Free users on premium courses get first 2 as teaser
  const maxFreeLessons = canAccessCourse ? course.lessons.length : 2;

  const getLessonStatus = (idx: number) => {
    const completed = isCompleted(course.lessons[idx].id);
    const premiumLocked = idx >= maxFreeLessons;
    // Sequential: locked if previous not completed (except first)
    const sequentialLocked = idx > 0 && !isCompleted(course.lessons[idx - 1].id) && !completed;
    const locked = premiumLocked || (sequentialLocked && !premiumLocked);
    return { completed, premiumLocked, sequentialLocked: locked && !premiumLocked, locked: premiumLocked || locked };
  };

  const hasVideo = (id: string) => !!LESSON_VIDEOS[id];
  const hasExercise = (id: string) => !!(LESSON_MOVES[id] || course.lessons.find(l => l.id === id)?.fen || course.lessons.find(l => l.id === id)?.practiceLine);

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> All Courses
      </button>

      {/* Course header card */}
      <div className="rounded-xl border border-border/50 bg-card p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="inline-flex rounded-lg bg-primary/10 p-3"><Icon className="h-6 w-6 text-primary" /></div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold text-foreground">{course.title}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">{course.level}</span>
              <span className="text-xs text-muted-foreground">{course.lessons.length} chapters</span>
              {!canAccessCourse && (
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                  <Lock className="w-2.5 h-2.5 mr-0.5" /> {maxFreeLessons} free previews
                </Badge>
              )}
            </div>
          </div>
        </div>
        <p className="text-muted-foreground mb-4">{course.description}</p>

        {/* Course progress bar */}
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{prog.completed}/{prog.total} completed</span>
          <span className="font-mono font-bold text-primary">{prog.percent}%</span>
        </div>
        <div className="w-full h-2.5 bg-muted rounded-full">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${prog.percent}%` }} />
        </div>
      </div>

      {/* Chapter list */}
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Chapters</h3>
      <div className="space-y-2">
        {course.lessons.map((lesson, idx) => {
          const status = getLessonStatus(idx);
          const bookmarked = isBookmarked(lesson.id);
          const video = hasVideo(lesson.id);
          const exercise = hasExercise(lesson.id);

          return (
            <button
              key={lesson.id}
              onClick={() => {
                if (status.premiumLocked) navigate("/premium");
                else if (status.sequentialLocked) toast({ title: "Complete previous chapter first", description: `Finish "${course.lessons[idx - 1].title}" to unlock this chapter.` });
                else onSelectLesson(idx);
              }}
              className={`w-full flex items-center gap-3 sm:gap-4 rounded-xl border bg-card p-4 transition-all text-left ${
                status.locked
                  ? "border-border/30 opacity-60"
                  : status.completed
                    ? "border-green-500/20 hover:border-green-500/30"
                    : "border-border/50 hover:border-primary/30 hover:shadow-glow"
              }`}
            >
              {/* Step indicator */}
              <span className={`flex items-center justify-center h-9 w-9 rounded-full shrink-0 text-sm font-bold ${
                status.completed
                  ? "bg-green-500/20 text-green-500"
                  : status.premiumLocked
                    ? "bg-muted text-muted-foreground"
                    : status.sequentialLocked
                      ? "bg-muted/50 text-muted-foreground/50"
                      : "bg-primary/10 text-primary"
              }`}>
                {status.completed ? <CheckCircle2 className="h-4 w-4" /> : status.premiumLocked ? <Lock className="h-3.5 w-3.5" /> : status.sequentialLocked ? <Lock className="h-3 w-3" /> : idx + 1}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate text-sm sm:text-base">{lesson.title}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{lesson.keyPoints[0]}</p>
                {/* Tags */}
                <div className="flex items-center gap-2 mt-1.5">
                  {video && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                      <Video className="w-2.5 h-2.5" /> Video
                    </span>
                  )}
                  {exercise && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                      <Play className="w-2.5 h-2.5" /> Exercise
                    </span>
                  )}
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-2 shrink-0">
                {bookmarked && <Bookmark className="h-3.5 w-3.5 text-primary fill-primary" />}
                {status.premiumLocked ? (
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                    <Crown className="w-2.5 h-2.5 mr-0.5" /> Unlock with Premium
                  </Badge>
                ) : status.sequentialLocked ? (
                  <span className="text-[10px] text-muted-foreground/60">Complete previous</span>
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!canAccessCourse && (
        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Enjoying the preview? Unlock all {course.lessons.length} chapters with Premium.
          </p>
          <Button onClick={() => navigate("/premium")} className="border-primary/30">
            <Crown className="w-4 h-4 mr-2" /> Unlock Full Course
          </Button>
        </div>
      )}
    </div>
  );
}

/* ──── Lesson View ──── */
function LessonView({
  course,
  lessonIdx,
  onBack,
  onNext,
  onPrev,
  isCompleted: isCompletedFn,
  isBookmarked: isBookmarkedFn,
  onMarkComplete,
  onToggleBookmark,
}: {
  course: Course;
  lessonIdx: number;
  onBack: () => void;
  onNext: () => void;
  onPrev: () => void;
  isCompleted: (id: string) => boolean;
  isBookmarked: (id: string) => boolean;
  onMarkComplete: (courseId: string, lessonId: string) => void;
  onToggleBookmark: (courseId: string, lessonId: string) => void;
}) {
  const { isPremium } = useAuth();
  const [showVideo, setShowVideo] = useState(false);
  const lesson = course.lessons[lessonIdx];
  const totalLessons = course.lessons.length;
  const completed = isCompletedFn(lesson.id);
  const bookmarked = isBookmarkedFn(lesson.id);
  const videoUrl = LESSON_VIDEOS[lesson.id];

  const lessonData = LESSON_MOVES[lesson.id];
  const variations: LessonVariation[] = useMemo(() => {
    if (lessonData?.variations && lessonData.variations.length > 0) return lessonData.variations;
    if (lessonData?.moves?.length) return [{ name: "", startFen: lessonData.startFen, moves: lessonData.moves }];
    if (lesson.fen) return [{ name: "Position", startFen: lesson.fen, moves: [] }];
    return [];
  }, [lesson.id]);

  const hasExercise = variations.length > 0;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to {course.title}
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary font-medium">{course.level}</span>
          <span>Chapter {lessonIdx + 1} of {totalLessons}</span>
          {completed && (
            <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-[10px]">
              <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Completed
            </Badge>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleBookmark(course.id, lesson.id); }}
          className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark chapter"}
        >
          {bookmarked ? <BookmarkCheck className="w-5 h-5 text-primary" /> : <Bookmark className="w-5 h-5 text-muted-foreground hover:text-primary" />}
        </button>
      </div>

      <h2 className="font-display text-2xl font-bold text-foreground mb-4">{lesson.title}</h2>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted rounded-full mb-6">
        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((lessonIdx + 1) / totalLessons) * 100}%` }} />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {videoUrl && (
          <Button
            size="sm"
            variant={showVideo ? "default" : "outline"}
            onClick={() => setShowVideo(!showVideo)}
          >
            <Video className="w-3.5 h-3.5 mr-1.5" /> {showVideo ? "Hide Video" : "Watch Video"}
          </Button>
        )}
        {hasExercise && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const el = document.getElementById("exercise-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Play className="w-3.5 h-3.5 mr-1.5" /> Play Exercise
          </Button>
        )}
      </div>

      {/* Video embed */}
      {showVideo && videoUrl && (
        <div className="mb-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Video className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">DailyChess_12 Video Lesson</span>
          </div>
          <YouTubeEmbed videoUrl={videoUrl} title={lesson.title} />
        </div>
      )}

      {/* Lesson content */}
      <div className="rounded-xl border border-border/50 bg-card p-6 mb-6">
        <h3 className="font-display text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" /> Lesson Content
        </h3>
        <p className="text-foreground leading-relaxed text-base">{lesson.content}</p>
      </div>

      {/* Key points */}
      {lesson.keyPoints.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-6 mb-6">
          <h3 className="font-display text-sm font-semibold text-foreground mb-3">Key Takeaways</h3>
          <ul className="space-y-2">
            {lesson.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Interactive board exercise */}
      {hasExercise && (
        <div id="exercise-section" className="mb-6">
          <h3 className="font-display text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Interactive Exercise
          </h3>
          <div className="space-y-6">
            {variations.map((variation, vIdx) => (
              <div key={vIdx}>
                {variation.name && (
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 text-center">
                    {variation.name}
                  </p>
                )}
                <InteractiveBoard
                  startFen={variation.startFen || lesson.fen}
                  moves={variation.moves}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Feedback */}
      <AIFeedbackPanel lesson={lesson} isPremium={isPremium} />

      {/* Mark as Complete + Navigation */}
      <div className="space-y-3">
        {!completed && (
          <Button
            onClick={() => {
              onMarkComplete(course.id, lesson.id);
              toast({ title: "Chapter completed! 🎉", description: `"${lesson.title}" marked as complete.` });
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Complete
          </Button>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={onPrev} disabled={lessonIdx === 0} className="flex-1">
            Previous
          </Button>
          <Button
            onClick={() => {
              if (!completed) onMarkComplete(course.id, lesson.id);
              onNext();
            }}
            disabled={lessonIdx === totalLessons - 1}
            className="flex-1"
          >
            {lessonIdx === totalLessons - 1 ? "Course Complete! 🏆" : "Next Chapter"}
            {lessonIdx < totalLessons - 1 && <ChevronRight className="ml-1 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ──── Main Page ──── */
type View = "list" | "course" | "lesson";

const Learn = () => {
  const { user } = useAuth();
  const [view, setView] = useState<View>("list");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessonIdx, setLessonIdx] = useState(0);
  const {
    streak, bookmarks: bookmarkData, loading,
    markComplete, toggleBookmark, isCompleted, isBookmarked, getCourseProgress,
  } = useLessonProgress();

  const goToLesson = useCallback((courseId: string, lessonId: string) => {
    const course = COURSES.find((c) => c.id === courseId);
    if (!course) return;
    const idx = course.lessons.findIndex((l) => l.id === lessonId);
    if (idx < 0) return;
    setSelectedCourse(course);
    setLessonIdx(idx);
    setView("lesson");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <h1 className="font-display text-4xl font-bold text-foreground text-center mb-2">
          Learn <span className="text-gradient-gold">Chess</span>
        </h1>
        <p className="text-center text-muted-foreground mb-6">
          {view === "list" && "Structured courses with interactive chapters, videos, and AI feedback."}
          {view === "course" && selectedCourse && `${selectedCourse.title} — ${selectedCourse.lessons.length} chapters`}
          {view === "lesson" && selectedCourse && `${selectedCourse.title} — Chapter ${lessonIdx + 1}`}
        </p>

        {view === "list" && user && !loading && (
          <>
            <StreakBanner streak={streak} />
            <BookmarkedPanel bookmarks={bookmarkData} onGoToLesson={goToLesson} />
          </>
        )}

        {view === "list" && (
          <CourseList
            onSelectCourse={(course) => { setSelectedCourse(course); setView("course"); }}
            getCourseProgress={getCourseProgress}
          />
        )}
        {view === "course" && selectedCourse && (
          <CourseDetail
            course={selectedCourse}
            onBack={() => setView("list")}
            onSelectLesson={(idx) => { setLessonIdx(idx); setView("lesson"); }}
            isCompleted={isCompleted}
            isBookmarked={isBookmarked}
            getCourseProgress={getCourseProgress}
          />
        )}
        {view === "lesson" && selectedCourse && (
          <LessonView
            course={selectedCourse}
            lessonIdx={lessonIdx}
            onBack={() => setView("course")}
            onNext={() => setLessonIdx((i) => Math.min(i + 1, selectedCourse.lessons.length - 1))}
            onPrev={() => setLessonIdx((i) => Math.max(i - 1, 0))}
            isCompleted={isCompleted}
            isBookmarked={isBookmarked}
            onMarkComplete={markComplete}
            onToggleBookmark={toggleBookmark}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Learn;
