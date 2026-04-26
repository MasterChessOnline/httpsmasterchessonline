import { useState, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  GraduationCap, Clock, Zap, Shield, Award, Swords,
} from "lucide-react";
import { COURSES, Course, Lesson, CourseCategory, CourseTier } from "@/lib/courses-data";
import { useAuth } from "@/contexts/AuthContext";

import InteractiveBoard from "@/components/learn/InteractiveBoard";
import VariationsExercise from "@/components/learn/VariationsExercise";
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
function AIFeedbackPanel({ lesson }: { lesson: Lesson }) {
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




/* ──── Course Card ──── */
function CourseCard({ course, onClick, progress }: {
  course: Course;
  onClick: () => void;
  progress: { completed: number; total: number; percent: number };
}) {
  const Icon = ICON_MAP[course.icon] || BookOpen;
  const lvl = LEVEL_CONFIG[course.level];
  const isMasterclass = course.tier === "masterclass";

  return (
    <motion.article
      onClick={onClick}
      className={`group relative rounded-xl border overflow-hidden transition-all cursor-pointer ${
        isMasterclass
          ? "border-primary/60 bg-gradient-to-br from-primary/10 via-card to-card shadow-[0_0_25px_hsl(43_90%_55%/0.15)] hover:shadow-[0_0_45px_hsl(43_90%_55%/0.3)]"
          : "border-border/50 hover:border-primary/40 bg-card"
      }`}
      whileHover={{ y: -4, boxShadow: isMasterclass ? "0 0 50px hsl(43 90% 55% / 0.35)" : "0 0 30px hsl(43 90% 55% / 0.1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className={`h-1 w-full ${isMasterclass ? "bg-gradient-to-r from-primary via-primary/80 to-primary" : "bg-primary/50"}`} />

      {isMasterclass && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-primary text-primary-foreground border-primary/60 text-[9px] uppercase tracking-wider font-bold shadow-lg">
            <Crown className="w-2.5 h-2.5 mr-1 fill-current" /> Masterclass
          </Badge>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <motion.div
            className={`rounded-lg ${isMasterclass ? "bg-primary/15" : lvl.bg} p-2.5 shrink-0`}
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Icon className={`h-5 w-5 ${isMasterclass ? "text-primary" : lvl.color}`} />
          </motion.div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-base font-bold text-foreground leading-tight pr-20">{course.title}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${lvl.color}`}>{course.level}</span>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className="text-[10px] text-muted-foreground">{course.lessons.length} chapters</span>
              {course.category && (
                <>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground capitalize">{course.category}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-4 break-words">{course.description}</p>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">{progress.completed} of {progress.total} chapters</span>
            <span className="font-mono font-bold text-primary">{progress.percent}%</span>
          </div>
          <Progress value={progress.percent} className="h-1.5" />
        </div>

        <Button className="mt-4 w-full btn-neon" size="sm">
          {progress.completed > 0 ? (
            <>{progress.percent === 100 ? "Review" : "Continue"} <ChevronRight className="ml-1 h-3.5 w-3.5" /></>
          ) : (
            <>{isMasterclass ? "Enter Masterclass" : "Start Course"} <ChevronRight className="ml-1 h-3.5 w-3.5" /></>
          )}
        </Button>
      </div>
    </motion.article>
  );
}

/* ──── Course List ──── */
const CORE_IDS = new Set(["core-beginner", "core-intermediate", "core-advanced"]);

function CourseList({ onSelectCourse, getCourseProgress }: {
  onSelectCourse: (course: Course) => void;
  getCourseProgress: (courseId: string, total: number) => { completed: number; total: number; percent: number };
}) {
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showAdditional, setShowAdditional] = useState(false);

  const levels = [
    { key: "all", label: "All Levels", icon: BookOpen },
    { key: "Beginner", label: "Beginner", icon: Shield },
    { key: "Intermediate", label: "Intermediate", icon: Zap },
    { key: "Advanced", label: "Advanced", icon: Award },
  ];

  const categories = [
    { key: "all", label: "All Topics", icon: BookOpen },
    { key: "openings", label: "Openings", icon: BookOpen },
    { key: "middlegame", label: "Middlegames", icon: Swords },
    { key: "endgame", label: "Endgames", icon: Target },
    { key: "strategy", label: "Strategy", icon: Brain },
    { key: "tactics", label: "Tactics", icon: Crosshair },
  ];

  const coreCourses = COURSES.filter((c) => CORE_IDS.has(c.id));
  const additionalCourses = COURSES.filter((c) => {
    if (CORE_IDS.has(c.id)) return false;
    if (levelFilter !== "all" && c.level !== levelFilter) return false;
    if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
    return true;
  });

  const totalCoreLessons = coreCourses.reduce((s, c) => s + c.lessons.length, 0);

  return (
    <>
      {/* All Free badge */}
      <div className="flex justify-center mb-6">
        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs px-3 py-1">
          <Shield className="w-3 h-3 mr-1.5" /> All {COURSES.reduce((s, c) => s + c.lessons.length, 0)}+ lessons are 100% free
        </Badge>
      </div>

      {/* ── CATEGORY CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { key: "openings", label: "Openings", icon: BookOpen, desc: "Opening theory & repertoire", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
          { key: "middlegame", label: "Middlegames", icon: Swords, desc: "Plans, attacks & defense", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
          { key: "endgame", label: "Endgames", icon: Target, desc: "Technique & calculation", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          { key: "strategy", label: "Strategy", icon: Brain, desc: "Positional mastery", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
        ].map((cat, i) => {
          const count = COURSES.filter(c => c.category === cat.key).reduce((s, c) => s + c.lessons.length, 0);
          return (
            <motion.button
              key={cat.key}
              onClick={() => {
                setCategoryFilter(prev => prev === cat.key ? "all" : cat.key);
                setShowAdditional(true);
              }}
              className={`relative rounded-xl border p-4 text-center transition-all group overflow-hidden ${
                categoryFilter === cat.key
                  ? `${cat.border} ${cat.bg} shadow-glow`
                  : "border-border/50 bg-card hover:border-primary/30"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -3, scale: 1.02 }}
            >
              <cat.icon className={`h-6 w-6 mx-auto mb-2 ${cat.color} group-hover:scale-110 transition-transform`} />
              <p className="text-sm font-semibold text-foreground">{cat.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{count}+ lessons</p>
            </motion.button>
          );
        })}
      </div>

      {/* ── CORE CURRICULUM ── */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" />
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <Star className="w-5 h-5 text-primary fill-primary" /> Core Curriculum · {totalCoreLessons} Lessons
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" />
        </div>
        <p className="text-center text-muted-foreground text-sm mb-5">
          Start here — 50 structured lessons from beginner to advanced, step by step.
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {coreCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => onSelectCourse(course)}
              progress={getCourseProgress(course.id, course.lessons.length)}
            />
          ))}
        </div>
      </div>

      {/* ── ADDITIONAL COURSES ── */}
      <div>
        <button
          onClick={() => setShowAdditional(!showAdditional)}
          className="w-full flex items-center justify-center gap-2 mb-6 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <div className="h-px flex-1 bg-border/50" />
          <span className="flex items-center gap-1.5 font-medium shrink-0">
            {showAdditional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showAdditional ? "Hide" : "Show"} Deep-Dive Courses ({additionalCourses.length})
          </span>
          <div className="h-px flex-1 bg-border/50" />
        </button>

        {showAdditional && (
          <>
            {/* Filters row */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 flex-wrap mb-8">
              {/* Level filter */}
              <div className="flex justify-center gap-2 flex-wrap">
                {levels.map(({ key, label, icon: LvlIcon }) => (
                  <button
                    key={key}
                    onClick={() => setLevelFilter(key)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all border ${
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
              {/* Category filter */}
              <div className="flex justify-center gap-2 flex-wrap">
                {categories.map(({ key, label, icon: CatIcon }) => (
                  <button
                    key={key}
                    onClick={() => setCategoryFilter(key)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all border ${
                      categoryFilter === key
                        ? "border-accent bg-accent/10 text-accent shadow-glow"
                        : "border-border/50 bg-card text-muted-foreground hover:border-accent/30 hover:text-foreground"
                    }`}
                  >
                    <CatIcon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {additionalCourses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                >
                  <CourseCard
                    course={course}
                    onClick={() => onSelectCourse(course)}
                    progress={getCourseProgress(course.id, course.lessons.length)}
                  />
                </motion.div>
              ))}
            </div>

            {additionalCourses.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No courses match your filters.</p>
              </div>
            )}
          </>
        )}
      </div>
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
  const Icon = ICON_MAP[course.icon] || BookOpen;
  const lvl = LEVEL_CONFIG[course.level];
  const prog = getCourseProgress(course.id, course.lessons.length);

  const getLessonStatus = (idx: number) => {
    const completed = isCompleted(course.lessons[idx].id);
    const sequentialLocked = idx > 0 && !isCompleted(course.lessons[idx - 1].id) && !completed;
    return { completed, premiumLocked: false, sequentialLocked, locked: sequentialLocked };
  };

  const hasVideo = (_id: string) => false;
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
        <div className={`h-1.5 w-full ${course.tier === "free" ? "bg-green-500/60" : "bg-primary/60"}`} />

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
          {!allCompleted && nextLessonIdx >= 0 && (
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
                if (status.sequentialLocked) toast({ title: "Complete previous chapter first", description: `Finish "${course.lessons[idx - 1].title}" to unlock this chapter.` });
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

              <div className="shrink-0">
                {status.sequentialLocked ? (
                  <span className="text-[10px] text-muted-foreground/40">Locked</span>
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </div>
            </button>
          );
        })}
      </div>

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
  
  const [showVideo, setShowVideo] = useState(false);
  const lesson = course.lessons[lessonIdx];
  const totalLessons = course.lessons.length;
  const completed = isCompletedFn(lesson.id);
  const bookmarked = isBookmarkedFn(lesson.id);
  const videoUrl = null;

  const lessonData = LESSON_MOVES[lesson.id];
  const variations: LessonVariation[] = useMemo(() => {
    if (lessonData?.variations && lessonData.variations.length > 0) return lessonData.variations;
    if (lessonData?.moves?.length) return [{ name: "", startFen: lessonData.startFen, moves: lessonData.moves }];
    if (lesson.fen) return [{ name: "Position", startFen: lesson.fen, moves: [] }];
    return [];
  }, [lesson.id]);

  const hasExercise = variations.length > 0;

  return (
    <div className="max-w-3xl lg:max-w-5xl mx-auto">
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
          <VariationsExercise variations={variations} fallbackFen={lesson.fen} />
        </div>
      )}

      {/* AI Feedback */}
      <AIFeedbackPanel lesson={lesson} />

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
    <div className="min-h-screen bg-background grid-bg">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground text-center mb-2 uppercase tracking-wider">
          Learn <span className="text-gradient-neon">Chess</span>
        </h1>
        <p className="text-center text-muted-foreground mb-8 max-w-md mx-auto text-sm">
          {view === "list" && "Structured training from beginner to advanced."}
          {view === "course" && selectedCourse && `${selectedCourse.title} — ${selectedCourse.lessons.length} chapters`}
          {view === "lesson" && selectedCourse && `${selectedCourse.title} — Chapter ${lessonIdx + 1}`}
        </p>

        {/* Coming Soon */}
        {view === "list" && (
          <Link to="/coming-soon" className="block mb-8 rounded-xl glass-neon p-5 opacity-70 hover:opacity-90 transition-opacity">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  New Features
                  <span className="text-[10px] uppercase tracking-widest text-primary/60 font-display">Coming Soon</span>
                </p>
                <p className="text-xs text-muted-foreground">Exciting new content is on the way.</p>
              </div>
            </div>
          </Link>
        )}

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
