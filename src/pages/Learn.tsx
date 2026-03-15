import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen, Target, Crown, Layout, Crosshair, Brain,
  ArrowLeft, ChevronRight, CheckCircle2, Lock, Star,
  Bookmark, BookmarkCheck, Flame, Trophy, BarChart3,
  Play, Video, Sparkles, Lightbulb, ChevronDown, ChevronUp,
  GraduationCap, Clock, Zap, Shield, Award,
} from "lucide-react";
import { COURSES, Course, Lesson, CourseCategory, CourseTier } from "@/lib/courses-data";
import { useAuth } from "@/contexts/AuthContext";
import { hasAccess } from "@/lib/premium-tiers";
import InteractiveBoard from "@/components/learn/InteractiveBoard";
import { LESSON_MOVES, LessonVariation } from "@/lib/lesson-moves";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { toast } from "@/hooks/use-toast";

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen, Target, Crown, Layout, Crosshair, Brain,
};

const LEVEL_CONFIG = {
  Beginner: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: Shield, label: "Beginner" },
  Intermediate: { color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", icon: Zap, label: "Intermediate" },
  Advanced: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Award, label: "Advanced" },
};

const TIER_CONFIG = {
  free: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", label: "Free" },
  premium: { color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", label: "Premium" },
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

/* ──── Stats Dashboard ──── */
function StatsDashboard({ streak, totalCourses, completedCourses }: {
  streak: { current_streak: number; longest_streak: number; total_lessons_completed: number };
  totalCourses: number;
  completedCourses: number;
}) {
  const stats = [
    { icon: Flame, label: "Daily Streak", value: streak.current_streak, suffix: streak.current_streak === 1 ? "day" : "days", color: "text-orange-400", bg: "bg-orange-500/10" },
    { icon: Trophy, label: "Best Streak", value: streak.longest_streak, suffix: streak.longest_streak === 1 ? "day" : "days", color: "text-primary", bg: "bg-primary/10" },
    { icon: CheckCircle2, label: "Lessons Done", value: streak.total_lessons_completed, suffix: "", color: "text-green-400", bg: "bg-green-500/10" },
    { icon: GraduationCap, label: "Courses", value: `${completedCourses}/${totalCourses}`, suffix: "", color: "text-blue-400", bg: "bg-blue-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {stats.map(({ icon: Icon, label, value, suffix, color, bg }) => (
        <div key={label} className={`rounded-xl border border-border/30 ${bg} p-4 text-center`}>
          <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
          <p className="text-2xl font-bold text-foreground font-mono">{value}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
            {suffix ? `${label}` : label}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ──── Bookmarked Lessons ──── */
function BookmarkedPanel({ bookmarks, onGoToLesson }: {
  bookmarks: { lesson_id: string; course_id: string }[];
  onGoToLesson: (courseId: string, lessonId: string) => void;
}) {
  if (bookmarks.length === 0) return null;
  return (
    <div className="mb-8 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-5">
      <div className="flex items-center gap-2 mb-3">
        <BookmarkCheck className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm font-semibold text-foreground">Continue Where You Left Off</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {bookmarks.slice(0, 6).map((b) => {
          const course = COURSES.find((c) => c.id === b.course_id);
          const lesson = course?.lessons.find((l) => l.id === b.lesson_id);
          if (!course || !lesson) return null;
          return (
            <button
              key={b.lesson_id}
              onClick={() => onGoToLesson(b.course_id, b.lesson_id)}
              className="text-xs px-3 py-2 rounded-lg bg-card border border-border/50 hover:border-primary/40 hover:shadow-glow transition-all text-left group"
            >
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">{course.title} →</span>{" "}
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
        <Button size="sm" className="mt-3 relative z-10" onClick={() => window.location.href = "/premium"}>
          <Crown className="w-3.5 h-3.5 mr-1.5" /> Unlock Full AI Feedback
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 mb-6">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between">
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

/* ──── Course Card ──── */
function CourseCard({ course, onClick, progress, accessible }: {
  course: Course;
  onClick: () => void;
  progress: { completed: number; total: number; percent: number };
  accessible: boolean;
}) {
  const Icon = ICON_MAP[course.icon] || BookOpen;
  const lvl = LEVEL_CONFIG[course.level];
  const tierCfg = TIER_CONFIG[course.tier];
  const navigate = useNavigate();

  return (
    <article
      onClick={() => accessible ? onClick() : navigate("/premium")}
      className={`group relative rounded-xl border bg-card overflow-hidden transition-all cursor-pointer hover:shadow-glow ${
        accessible ? "border-border/50 hover:border-primary/40" : "border-border/30 opacity-75"
      }`}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full ${course.tier === "free" ? "bg-green-500/50" : "bg-primary/50"}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`rounded-lg ${lvl.bg} p-2.5 shrink-0`}>
            <Icon className={`h-5 w-5 ${lvl.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-base font-bold text-foreground leading-tight">{course.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${lvl.color}`}>{course.level}</span>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${tierCfg.color}`}>{tierCfg.label}</span>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className="text-[10px] text-muted-foreground">{course.lessons.length} chapters</span>
            </div>
          </div>
          {!accessible && (
            <Badge className={`text-[10px] ${tierCfg.bg} ${tierCfg.color} ${tierCfg.border} shrink-0`}>
              <Lock className="w-2.5 h-2.5 mr-0.5" /> Premium
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">{course.description}</p>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">{progress.completed} of {progress.total} chapters</span>
            <span className="font-mono font-bold text-primary">{progress.percent}%</span>
          </div>
          <Progress value={progress.percent} className="h-1.5" />
        </div>

        {/* CTA */}
        <Button className="mt-4 w-full" size="sm" variant={accessible ? "default" : "outline"}>
          {accessible ? (
            progress.completed > 0 ? (
              <>{progress.percent === 100 ? "Review" : "Continue"} <ChevronRight className="ml-1 h-3.5 w-3.5" /></>
            ) : (
              <>Start Course <ChevronRight className="ml-1 h-3.5 w-3.5" /></>
            )
          ) : (
            <><Lock className="mr-1 h-3 w-3" /> Unlock with {lvl.label}</>
          )}
        </Button>
      </div>
    </article>
  );
}

/* ──── Course List ──── */
function CourseList({ onSelectCourse, getCourseProgress }: {
  onSelectCourse: (course: Course) => void;
  getCourseProgress: (courseId: string, total: number) => { completed: number; total: number; percent: number };
}) {
  const { isPremium, subscriptionTier } = useAuth();
  const navigate = useNavigate();
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const levels = [
    { key: "all", label: "All Levels", icon: BookOpen },
    { key: "Beginner", label: "Beginner", icon: Shield },
    { key: "Intermediate", label: "Intermediate", icon: Zap },
    { key: "Advanced", label: "Advanced", icon: Award },
  ];

  const filtered = levelFilter === "all" ? COURSES : COURSES.filter((c) => c.level === levelFilter);

  const canAccessCourse = (course: Course) => {
    if (course.level === "Beginner") return true;
    if (course.level === "Intermediate") return hasAccess(subscriptionTier, "premium");
    if (course.level === "Advanced") return hasAccess(subscriptionTier, "pro");
    return true;
  };

  return (
    <>
      {/* Tier badge */}
      <div className="flex justify-center mb-6">
        {!isPremium && (
          <Badge className="bg-muted text-muted-foreground border-border text-xs px-3 py-1">
            <Shield className="w-3 h-3 mr-1.5" /> Free Plan — Beginner courses + 2 preview chapters per premium course
          </Badge>
        )}
        {isPremium && !hasAccess(subscriptionTier, "pro") && (
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs px-3 py-1">
            <Crown className="w-3 h-3 mr-1.5" /> Premium — Beginner & Intermediate unlocked
          </Badge>
        )}
        {hasAccess(subscriptionTier, "pro") && (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs px-3 py-1">
            <Star className="w-3 h-3 mr-1.5" /> Pro — All courses unlocked
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {levels.map(({ key, label, icon: LvlIcon }) => (
          <button
            key={key}
            onClick={() => setLevelFilter(key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all border ${
              levelFilter === key
                ? "border-primary bg-primary/10 text-primary shadow-glow"
                : "border-border/50 bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }`}
          >
            <LvlIcon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Course grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onClick={() => onSelectCourse(course)}
            progress={getCourseProgress(course.id, course.lessons.length)}
            accessible={canAccessCourse(course)}
          />
        ))}
      </div>

      {/* Upsell */}
      {!isPremium && (
        <div className="mt-12 max-w-lg mx-auto rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-8 text-center">
          <Crown className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Unlock Premium Learning</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
            Get unlimited course access, AI feedback from DailyChess_12, exclusive video lessons, and personalized training plans.
          </p>
          <Button onClick={() => navigate("/premium")} size="lg">
            View Plans — from $4.99/mo
          </Button>
        </div>
      )}
    </>
  );
}

/* ──── Course Detail (Chapter Overview) ──── */
function CourseDetail({ course, onBack, onSelectLesson, isCompleted, isBookmarked, getCourseProgress }: {
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
  const lvl = LEVEL_CONFIG[course.level];
  const prog = getCourseProgress(course.id, course.lessons.length);

  const canAccessCourse = (() => {
    if (course.level === "Beginner") return true;
    if (course.level === "Intermediate") return hasAccess(subscriptionTier, "premium");
    if (course.level === "Advanced") return hasAccess(subscriptionTier, "pro");
    return true;
  })();

  const maxFreeLessons = canAccessCourse ? course.lessons.length : 2;

  const getLessonStatus = (idx: number) => {
    const completed = isCompleted(course.lessons[idx].id);
    const premiumLocked = idx >= maxFreeLessons;
    const sequentialLocked = idx > 0 && !isCompleted(course.lessons[idx - 1].id) && !completed;
    const locked = premiumLocked || (sequentialLocked && !premiumLocked);
    return { completed, premiumLocked, sequentialLocked: locked && !premiumLocked, locked: premiumLocked || locked };
  };

  const hasVideo = (id: string) => !!LESSON_VIDEOS[id];
  const hasExercise = (id: string) => !!(LESSON_MOVES[id] || course.lessons.find(l => l.id === id)?.fen || course.lessons.find(l => l.id === id)?.practiceLine);

  // Find next uncompleted lesson
  const nextLessonIdx = course.lessons.findIndex((l) => !isCompleted(l.id));
  const allCompleted = nextLessonIdx === -1;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> All Courses
      </button>

      {/* Course Header Card */}
      <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card via-card to-muted/20 overflow-hidden mb-8">
        {/* Accent bar */}
        <div className={`h-1.5 w-full ${course.level === "Beginner" ? "bg-green-500/60" : course.level === "Intermediate" ? "bg-primary/60" : "bg-blue-500/60"}`} />

        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-5">
            <div className={`rounded-xl ${lvl.bg} p-3.5 shrink-0`}>
              <Icon className={`h-7 w-7 ${lvl.color}`} />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight">{course.title}</h2>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider ${lvl.color}`}>
                  <lvl.icon className="w-3 h-3" /> {course.level}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> {course.lessons.length} chapters
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> ~{Math.ceil(course.lessons.length * 5)} min
                </span>
                {!canAccessCourse && (
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                    <Lock className="w-2.5 h-2.5 mr-0.5" /> {maxFreeLessons} free previews
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed mb-5">{course.description}</p>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{prog.completed} of {prog.total} chapters completed</span>
              <span className="font-mono font-bold text-primary">{prog.percent}%</span>
            </div>
            <Progress value={prog.percent} className="h-2.5" />
          </div>

          {/* Quick action */}
          {!allCompleted && canAccessCourse && nextLessonIdx >= 0 && (
            <Button
              className="mt-5"
              onClick={() => onSelectLesson(nextLessonIdx)}
            >
              <Play className="w-4 h-4 mr-2" />
              {prog.completed > 0 ? "Continue Learning" : "Start Chapter 1"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
          {allCompleted && (
            <div className="mt-5 flex items-center gap-2 text-green-400 text-sm font-medium">
              <Trophy className="w-5 h-5" /> Course completed! 🏆
            </div>
          )}
        </div>
      </div>

      {/* Chapter List */}
      <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" /> Course Chapters
      </h3>

      <div className="space-y-2.5">
        {course.lessons.map((lesson, idx) => {
          const status = getLessonStatus(idx);
          const bookmarked = isBookmarked(lesson.id);
          const video = hasVideo(lesson.id);
          const exercise = hasExercise(lesson.id);
          const isNext = idx === nextLessonIdx && !status.locked;

          return (
            <button
              key={lesson.id}
              onClick={() => {
                if (status.premiumLocked) navigate("/premium");
                else if (status.sequentialLocked) toast({ title: "Complete previous chapter first", description: `Finish "${course.lessons[idx - 1].title}" to unlock this chapter.` });
                else onSelectLesson(idx);
              }}
              className={`w-full flex items-center gap-3 sm:gap-4 rounded-xl border p-4 transition-all text-left group ${
                isNext
                  ? "border-primary/40 bg-primary/5 shadow-glow"
                  : status.locked
                    ? "border-border/20 bg-card/50 opacity-50"
                    : status.completed
                      ? "border-green-500/20 bg-card hover:border-green-500/30"
                      : "border-border/40 bg-card hover:border-primary/30 hover:shadow-glow"
              }`}
            >
              {/* Chapter number circle */}
              <span className={`flex items-center justify-center h-10 w-10 rounded-full shrink-0 text-sm font-bold transition-colors ${
                status.completed
                  ? "bg-green-500/20 text-green-400"
                  : isNext
                    ? "bg-primary/20 text-primary ring-2 ring-primary/30"
                    : status.premiumLocked
                      ? "bg-muted/50 text-muted-foreground/50"
                      : status.sequentialLocked
                        ? "bg-muted/30 text-muted-foreground/30"
                        : "bg-primary/10 text-primary"
              }`}>
                {status.completed ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : status.locked ? (
                  <Lock className="h-3.5 w-3.5" />
                ) : (
                  idx + 1
                )}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-medium truncate text-sm sm:text-base ${status.locked ? "text-muted-foreground/60" : "text-foreground"}`}>
                    {lesson.title}
                  </p>
                  {isNext && (
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] shrink-0">
                      Next
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{lesson.keyPoints[0]}</p>
                {/* Feature tags */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  {video && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded-full">
                      <Video className="w-2.5 h-2.5" /> Video
                    </span>
                  )}
                  {exercise && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded-full">
                      <Play className="w-2.5 h-2.5" /> Exercise
                    </span>
                  )}
                  {bookmarked && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      <Bookmark className="w-2.5 h-2.5 fill-primary" /> Saved
                    </span>
                  )}
                </div>
              </div>

              {/* Right side */}
              <div className="shrink-0">
                {status.premiumLocked ? (
                  <Badge className="bg-primary/15 text-primary border-primary/25 text-[10px]">
                    <Crown className="w-2.5 h-2.5 mr-0.5" /> Premium
                  </Badge>
                ) : status.sequentialLocked ? (
                  <span className="text-[10px] text-muted-foreground/40">Locked</span>
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!canAccessCourse && (
        <div className="mt-8 text-center rounded-xl border border-primary/30 bg-primary/5 p-6">
          <Crown className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            Enjoying the preview? Unlock all {course.lessons.length} chapters.
          </p>
          <Button onClick={() => navigate("/premium")}>
            <Crown className="w-4 h-4 mr-2" /> Unlock Full Course
          </Button>
        </div>
      )}
    </div>
  );
}

/* ──── Lesson View ──── */
function LessonView({ course, lessonIdx, onBack, onNext, onPrev, isCompleted: isCompletedFn, isBookmarked: isBookmarkedFn, onMarkComplete, onToggleBookmark }: {
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

      {/* Chapter header */}
      <div className="rounded-xl border border-border/50 bg-card p-5 mb-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={`rounded-full px-2 py-0.5 font-medium text-[10px] uppercase tracking-wider ${LEVEL_CONFIG[course.level].bg} ${LEVEL_CONFIG[course.level].color}`}>
              {course.level}
            </span>
            <span>Chapter {lessonIdx + 1} / {totalLessons}</span>
            {completed && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">
                <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Done
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

        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">{lesson.title}</h2>

        {/* Chapter progress */}
        <Progress value={((lessonIdx + 1) / totalLessons) * 100} className="h-1.5" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {videoUrl && (
          <Button size="sm" variant={showVideo ? "default" : "outline"} onClick={() => setShowVideo(!showVideo)}>
            <Video className="w-3.5 h-3.5 mr-1.5" /> {showVideo ? "Hide Video" : "Watch Video"}
          </Button>
        )}
        {hasExercise && (
          <Button size="sm" variant="outline" onClick={() => document.getElementById("exercise-section")?.scrollIntoView({ behavior: "smooth" })}>
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
          <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" /> Key Takeaways
          </h3>
          <ul className="space-y-2">
            {lesson.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" /> {point}
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
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 text-center">{variation.name}</p>
                )}
                <InteractiveBoard startFen={variation.startFen || lesson.fen} moves={variation.moves} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Feedback */}
      <AIFeedbackPanel lesson={lesson} isPremium={isPremium} />

      {/* Mark as Complete + Navigation */}
      <div className="space-y-3 mt-8">
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
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Previous
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
            {lessonIdx < totalLessons - 1 && <ChevronRight className="ml-1 h-3.5 w-3.5" />}
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

  // Calculate completed courses
  const completedCourses = useMemo(() => {
    return COURSES.filter(c => {
      const prog = getCourseProgress(c.id, c.lessons.length);
      return prog.percent === 100;
    }).length;
  }, [getCourseProgress]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground text-center mb-2">
          Learn <span className="text-gradient-gold">Chess</span>
        </h1>
        <p className="text-center text-muted-foreground mb-8 max-w-md mx-auto text-sm">
          {view === "list" && "Structured courses with interactive chapters, videos, and AI feedback by DailyChess_12."}
          {view === "course" && selectedCourse && `${selectedCourse.title} — ${selectedCourse.lessons.length} chapters`}
          {view === "lesson" && selectedCourse && `${selectedCourse.title} — Chapter ${lessonIdx + 1}`}
        </p>

        {view === "list" && user && !loading && (
          <>
            <StatsDashboard streak={streak} totalCourses={COURSES.length} completedCourses={completedCourses} />
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
