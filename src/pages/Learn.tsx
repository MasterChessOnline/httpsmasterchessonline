import { useState, useCallback, useMemo } from "react";
import { Chess, Square } from "chess.js";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Target, Crown, Layout, Crosshair, Brain, ArrowLeft, ChevronRight, CheckCircle2, Lock, Star } from "lucide-react";
import { COURSES, Course, Lesson } from "@/lib/courses-data";
import { useAuth } from "@/contexts/AuthContext";
import { hasAccess } from "@/lib/premium-tiers";
import InteractiveBoard from "@/components/learn/InteractiveBoard";
import { LESSON_MOVES } from "@/lib/lesson-moves";

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen, Target, Crown, Layout, Crosshair, Brain,
};

const PIECE_DISPLAY: Record<string, { symbol: string; className: string }> = {
  wk: { symbol: "♚", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wq: { symbol: "♛", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wr: { symbol: "♜", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wb: { symbol: "♝", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wn: { symbol: "♞", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wp: { symbol: "♟", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  bk: { symbol: "♚", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bq: { symbol: "♛", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  br: { symbol: "♜", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bb: { symbol: "♝", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bn: { symbol: "♞", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bp: { symbol: "♟", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

function parseFen(fen: string) {
  const rows = fen.split(" ")[0].split("/");
  const board: (null | { color: string; type: string })[][] = [];
  for (const row of rows) {
    const boardRow: (null | { color: string; type: string })[] = [];
    for (const ch of row) {
      if (/\d/.test(ch)) { for (let i = 0; i < parseInt(ch); i++) boardRow.push(null); }
      else { boardRow.push({ color: ch === ch.toUpperCase() ? "w" : "b", type: ch.toLowerCase() }); }
    }
    board.push(boardRow);
  }
  return board;
}

function MiniBoard({ fen }: { fen: string }) {
  const board = parseFen(fen);
  return (
    <div className="w-full max-w-[280px] mx-auto rounded-lg overflow-hidden border border-border/50">
      {RANKS.map((rank, ri) => (
        <div key={rank} className="flex">
          {FILES.map((file, fi) => {
            const isLight = (ri + fi) % 2 === 0;
            const piece = board[ri]?.[fi];
            const pieceKey = piece ? `${piece.color}${piece.type}` : null;
            const pieceDisplay = pieceKey ? PIECE_DISPLAY[pieceKey] : null;
            return (
              <div key={`${file}${rank}`} className={`aspect-square w-[12.5%] flex items-center justify-center text-xl sm:text-2xl ${isLight ? "bg-board-light" : "bg-board-dark"}`}>
                {pieceDisplay && <span className={pieceDisplay.className}>{pieceDisplay.symbol}</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function getRequiredTier(level: string): string | null {
  if (level === "Advanced") return "pro";
  if (level === "Intermediate") return null; // free with premium
  return null; // Beginner always free
}

function CourseList({ onSelectCourse }: { onSelectCourse: (course: Course) => void }) {
  const { isPremium, subscriptionTier } = useAuth();
  const navigate = useNavigate();
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const levels = ["all", "Beginner", "Intermediate", "Advanced"];
  const filtered = levelFilter === "all" ? COURSES : COURSES.filter((c) => c.level === levelFilter);

  const canAccessCourse = (course: Course) => {
    if (course.level === "Beginner") return true; // free for all
    if (course.level === "Intermediate") return true; // free for all, but limited lessons for free users
    if (course.level === "Advanced") return hasAccess(subscriptionTier, "pro");
    return true;
  };

  return (
    <>
      {/* Tier info */}
      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        {!isPremium && (
          <Badge className="bg-muted text-muted-foreground border-border">
            Free: Beginner & Intermediate courses available
          </Badge>
        )}
        {isPremium && !hasAccess(subscriptionTier, "pro") && (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <Crown className="w-3 h-3 mr-1" /> Premium — All beginner & intermediate courses
          </Badge>
        )}
        {hasAccess(subscriptionTier, "pro") && (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Star className="w-3 h-3 mr-1" /> Pro — All courses unlocked including Advanced
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
          return (
            <article
              key={course.id}
              className={`group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-glow cursor-pointer relative ${!accessible ? "opacity-70" : ""}`}
              onClick={() => accessible ? onSelectCourse(course) : navigate("/premium")}
            >
              {!accessible && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                    <Lock className="w-2.5 h-2.5 mr-0.5" /> Pro
                  </Badge>
                </div>
              )}
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-lg font-semibold text-foreground">{course.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{course.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary font-medium">{course.level}</span>
                <span>{course.lessons.length} lessons</span>
              </div>
              <Button className="mt-4 w-full" size="sm" variant={accessible ? "default" : "outline"}>
                {accessible ? (
                  <>Start Course <ChevronRight className="ml-1 h-4 w-4" /></>
                ) : (
                  <>
                    <Lock className="mr-1 h-3.5 w-3.5" /> Requires Pro
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

function LessonView({ course, lessonIdx, onBack, onNext, onPrev }: {
  course: Course; lessonIdx: number; onBack: () => void; onNext: () => void; onPrev: () => void;
}) {
  const lesson = course.lessons[lessonIdx];
  const totalLessons = course.lessons.length;
  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to {course.title}
      </button>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary font-medium">{course.level}</span>
        <span>Lesson {lessonIdx + 1} of {totalLessons}</span>
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-4">{lesson.title}</h2>
      <div className="w-full h-1.5 bg-muted rounded-full mb-6">
        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((lessonIdx + 1) / totalLessons) * 100}%` }} />
      </div>
      <div className="rounded-xl border border-border/50 bg-card p-6 mb-6">
        <p className="text-foreground leading-relaxed text-base">{lesson.content}</p>
      </div>
      <div className="mb-6">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 text-center">
          Interactive Board
        </p>
        <InteractiveBoard
          startFen={LESSON_MOVES[lesson.id]?.startFen || lesson.fen}
          moves={LESSON_MOVES[lesson.id]?.moves || []}
        />
      </div>
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
      <div className="flex gap-3">
        <Button variant="outline" onClick={onPrev} disabled={lessonIdx === 0} className="flex-1">Previous</Button>
        <Button onClick={onNext} disabled={lessonIdx === totalLessons - 1} className="flex-1">
          {lessonIdx === totalLessons - 1 ? "Course Complete!" : "Next Lesson"}
          {lessonIdx < totalLessons - 1 && <ChevronRight className="ml-1 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function CourseDetail({ course, onBack, onSelectLesson }: {
  course: Course; onBack: () => void; onSelectLesson: (idx: number) => void;
}) {
  const { isPremium } = useAuth();
  const navigate = useNavigate();
  const Icon = ICON_MAP[course.icon] || BookOpen;
  // Free users: first 2 lessons only for intermediate+
  const maxFreeLessons = course.level === "Beginner" ? course.lessons.length : (!isPremium ? 2 : course.lessons.length);

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
        <p className="text-muted-foreground">{course.description}</p>
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Lessons</h3>
      <div className="space-y-2">
        {course.lessons.map((lesson, idx) => {
          const locked = idx >= maxFreeLessons;
          return (
            <button
              key={lesson.id}
              onClick={() => locked ? navigate("/premium") : onSelectLesson(idx)}
              className={`w-full flex items-center gap-4 rounded-lg border border-border/50 bg-card p-4 hover:border-primary/30 hover:shadow-glow transition-all text-left ${locked ? "opacity-60" : ""}`}
            >
              <span className={`flex items-center justify-center h-8 w-8 rounded-full ${locked ? "bg-muted" : "bg-primary/10"} text-${locked ? "muted-foreground" : "primary"} text-sm font-bold shrink-0`}>
                {locked ? <Lock className="h-3.5 w-3.5" /> : idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{lesson.title}</p>
                <p className="text-xs text-muted-foreground truncate">{lesson.keyPoints[0]}</p>
              </div>
              {locked ? (
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]"><Crown className="w-2.5 h-2.5 mr-0.5" /> Premium</Badge>
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
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

type View = "list" | "course" | "lesson";

const Learn = () => {
  const [view, setView] = useState<View>("list");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessonIdx, setLessonIdx] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <h1 className="font-display text-4xl font-bold text-foreground text-center mb-2">
          Learn <span className="text-gradient-gold">Chess</span>
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          {view === "list" && "Structured courses from beginner to advanced."}
          {view === "course" && selectedCourse && `${selectedCourse.title} — ${selectedCourse.lessons.length} lessons`}
          {view === "lesson" && selectedCourse && `${selectedCourse.title} — Lesson ${lessonIdx + 1}`}
        </p>
        {view === "list" && (
          <CourseList onSelectCourse={(course) => { setSelectedCourse(course); setView("course"); }} />
        )}
        {view === "course" && selectedCourse && (
          <CourseDetail course={selectedCourse} onBack={() => setView("list")} onSelectLesson={(idx) => { setLessonIdx(idx); setView("lesson"); }} />
        )}
        {view === "lesson" && selectedCourse && (
          <LessonView
            course={selectedCourse}
            lessonIdx={lessonIdx}
            onBack={() => setView("course")}
            onNext={() => setLessonIdx((i) => Math.min(i + 1, selectedCourse.lessons.length - 1))}
            onPrev={() => setLessonIdx((i) => Math.max(i - 1, 0))}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Learn;
