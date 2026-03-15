import { useState, useCallback } from "react";
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
  Play, Video,
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

/* ──── YouTube Embed Component ──── */
function YouTubeEmbed({ videoUrl, title }: { videoUrl: string; title: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border/50 mb-6">
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
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border/30">
        <Flame className="w-5 h-5 text-orange-500" />
        <div>
          <p className="text-xs text-muted-foreground">Daily Streak</p>
          <p className="text-lg font-bold text-foreground font-mono">{streak.current_streak} day{streak.current_streak !== 1 ? "s" : ""}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border/30">
        <Trophy className="w-5 h-5 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">Best Streak</p>
          <p className="text-lg font-bold text-foreground font-mono">{streak.longest_streak} day{streak.longest_streak !== 1 ? "s" : ""}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border/30">
        <BarChart3 className="w-5 h-5 text-green-500" />
        <div>
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="text-lg font-bold text-foreground font-mono">{streak.total_lessons_completed} lesson{streak.total_lessons_completed !== 1 ? "s" : ""}</p>
        </div>
      </div>
    </div>
  );
}

/* ──── Bookmarked Lessons Panel ──── */
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
        <h3 className="font-display text-sm font-semibold text-foreground">Bookmarked Lessons</h3>
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
            Free: Beginner courses only
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

      <div className="flex justify-center gap-2 mb-8">
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
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{course.description}</p>

              {/* Progress bar */}
              {accessible && prog.completed > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>{prog.completed}/{prog.total} completed</span>
                    <span>{prog.percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${prog.percent}%` }} />
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary font-medium">{course.level}</span>
                <span>{course.lessons.length} lessons</span>
              </div>
              <Button className="mt-4 w-full" size="sm" variant={accessible ? "default" : "outline"}>
                {accessible ? (
                  prog.completed > 0 ? (
                    <>{prog.percent === 100 ? "Review Course" : "Continue"} <ChevronRight className="ml-1 h-4 w-4" /></>
                  ) : (
                    <>Start Course <ChevronRight className="ml-1 h-4 w-4" /></>
                  )
                ) : (
                  <>
                    <Lock className="mr-1 h-3.5 w-3.5" /> Requires {course.level === "Advanced" ? "Pro" : "Premium"}
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
            Get unlimited course access, video lessons, and personalized training with a Premium subscription.
          </p>
          <Button onClick={() => navigate("/premium")} className="bg-primary text-primary-foreground">
            View Plans — from $4.99/mo
          </Button>
        </div>
      )}
    </>
  );
}

/* ──── Course Detail ──── */
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
  const { isPremium } = useAuth();
  const navigate = useNavigate();
  const Icon = ICON_MAP[course.icon] || BookOpen;
  const maxFreeLessons = course.level === "Beginner" ? course.lessons.length : (!isPremium ? 2 : course.lessons.length);
  const prog = getCourseProgress(course.id, course.lessons.length);

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> All Courses
      </button>
      <div className="rounded-xl border border-border/50 bg-card p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="inline-flex rounded-lg bg-primary/10 p-3"><Icon className="h-6 w-6 text-primary" /></div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">{course.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">{course.level}</span>
              <span className="text-xs text-muted-foreground">{course.lessons.length} lessons</span>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground mb-4">{course.description}</p>

        {/* Course progress */}
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{prog.completed}/{prog.total} completed</span>
          <span>{prog.percent}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${prog.percent}%` }} />
        </div>
      </div>

      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Lessons</h3>
      <div className="space-y-2">
        {course.lessons.map((lesson, idx) => {
          const locked = idx >= maxFreeLessons;
          const completed = isCompleted(lesson.id);
          const bookmarked = isBookmarked(lesson.id);

          return (
            <button
              key={lesson.id}
              onClick={() => locked ? navigate("/premium") : onSelectLesson(idx)}
              className={`w-full flex items-center gap-4 rounded-lg border border-border/50 bg-card p-4 hover:border-primary/30 hover:shadow-glow transition-all text-left ${locked ? "opacity-60" : ""}`}
            >
              <span className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 text-sm font-bold ${
                completed
                  ? "bg-green-500/20 text-green-500"
                  : locked
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary/10 text-primary"
              }`}>
                {completed ? <CheckCircle2 className="h-4 w-4" /> : locked ? <Lock className="h-3.5 w-3.5" /> : idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{lesson.title}</p>
                <p className="text-xs text-muted-foreground truncate">{lesson.keyPoints[0]}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {bookmarked && <Bookmark className="h-3.5 w-3.5 text-primary fill-primary" />}
                {locked ? (
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]"><Crown className="w-2.5 h-2.5 mr-0.5" /> Premium</Badge>
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>
          );
        })}
      </div>
      {maxFreeLessons < course.lessons.length && (
        <div className="mt-6 text-center">
          <Button onClick={() => navigate("/premium")} variant="outline" className="border-primary/30 text-primary">
            <Crown className="w-4 h-4 mr-2" /> Unlock all {course.lessons.length} lessons
          </Button>
        </div>
      )}
    </div>
  );
}

/* ──── DailyChess_12 Video Tips (embedded per lesson) ──── */
const LESSON_VIDEOS: Record<string, string> = {
  "of-1": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "of-4": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "tp-1": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "tp-2": "https://www.youtube.com/embed/dQw4w9WgXcQ",
};

/* ──── Lesson View ──── */
function LessonView({
  course,
  lessonIdx,
  onBack,
  onNext,
  onPrev,
  isCompleted,
  isBookmarked,
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
  const lesson = course.lessons[lessonIdx];
  const totalLessons = course.lessons.length;
  const completed = isCompleted(lesson.id);
  const bookmarked = isBookmarked(lesson.id);
  const videoUrl = LESSON_VIDEOS[lesson.id];

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to {course.title}
      </button>

      {/* Lesson header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary font-medium">{course.level}</span>
          <span>Lesson {lessonIdx + 1} of {totalLessons}</span>
          {completed && (
            <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-[10px]">
              <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Completed
            </Badge>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleBookmark(course.id, lesson.id); }}
          className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark lesson"}
        >
          {bookmarked ? (
            <BookmarkCheck className="w-5 h-5 text-primary" />
          ) : (
            <Bookmark className="w-5 h-5 text-muted-foreground hover:text-primary" />
          )}
        </button>
      </div>

      <h2 className="font-display text-2xl font-bold text-foreground mb-4">{lesson.title}</h2>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted rounded-full mb-6">
        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((lessonIdx + 1) / totalLessons) * 100}%` }} />
      </div>

      {/* Video embed */}
      {videoUrl && (
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Video className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">DailyChess_12 Video Tip</span>
          </div>
          <YouTubeEmbed videoUrl={videoUrl} title={lesson.title} />
        </div>
      )}

      {/* Lesson content */}
      <div className="rounded-xl border border-border/50 bg-card p-6 mb-6">
        <p className="text-foreground leading-relaxed text-base">{lesson.content}</p>
      </div>

      {/* Interactive board */}
      {(() => {
        const lessonData = LESSON_MOVES[lesson.id];
        const variations: LessonVariation[] = lessonData?.variations && lessonData.variations.length > 0
          ? lessonData.variations
          : lessonData?.moves?.length
            ? [{ name: "", startFen: lessonData.startFen, moves: lessonData.moves }]
            : lesson.fen
              ? [{ name: "Position", startFen: lesson.fen, moves: [] }]
              : [];

        return variations.length > 0 ? (
          <div className="space-y-6 mb-6">
            {variations.map((variation, vIdx) => (
              <div key={vIdx}>
                {variation.name && (
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 text-center">
                    {variation.name}
                  </p>
                )}
                {!variation.name && variations.length === 1 && (
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 text-center">
                    Interactive Board
                  </p>
                )}
                <InteractiveBoard
                  startFen={variation.startFen || lesson.fen}
                  moves={variation.moves}
                />
              </div>
            ))}
          </div>
        ) : null;
      })()}

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

      {/* Mark as Complete + Navigation */}
      <div className="space-y-3">
        {!completed && (
          <Button
            onClick={() => {
              onMarkComplete(course.id, lesson.id);
              toast({ title: "Lesson completed! 🎉", description: `"${lesson.title}" marked as complete.` });
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Complete
          </Button>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={onPrev} disabled={lessonIdx === 0} className="flex-1">Previous</Button>
          <Button
            onClick={() => {
              if (!completed) {
                onMarkComplete(course.id, lesson.id);
              }
              onNext();
            }}
            disabled={lessonIdx === totalLessons - 1}
            className="flex-1"
          >
            {lessonIdx === totalLessons - 1 ? "Course Complete!" : "Next Lesson"}
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
          {view === "list" && "Structured courses from beginner to advanced."}
          {view === "course" && selectedCourse && `${selectedCourse.title} — ${selectedCourse.lessons.length} lessons`}
          {view === "lesson" && selectedCourse && `${selectedCourse.title} — Lesson ${lessonIdx + 1}`}
        </p>

        {/* Streak + Bookmarks on list view */}
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
