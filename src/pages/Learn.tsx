import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, Crown, Layout, Crosshair, Brain, ArrowLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { COURSES, Course, Lesson } from "@/lib/courses-data";

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
      if (/\d/.test(ch)) {
        for (let i = 0; i < parseInt(ch); i++) boardRow.push(null);
      } else {
        const color = ch === ch.toUpperCase() ? "w" : "b";
        const type = ch.toLowerCase();
        boardRow.push({ color, type });
      }
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
              <div
                key={`${file}${rank}`}
                className={`aspect-square w-[12.5%] flex items-center justify-center text-xl sm:text-2xl ${isLight ? "bg-board-light" : "bg-board-dark"}`}
              >
                {pieceDisplay && <span className={pieceDisplay.className}>{pieceDisplay.symbol}</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Course list view
function CourseList({ onSelectCourse }: { onSelectCourse: (course: Course) => void }) {
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const levels = ["all", "Beginner", "Intermediate", "Advanced"];
  const filtered = levelFilter === "all" ? COURSES : COURSES.filter((c) => c.level === levelFilter);

  return (
    <>
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
          return (
            <article
              key={course.id}
              className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-glow cursor-pointer"
              onClick={() => onSelectCourse(course)}
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-lg font-semibold text-foreground">{course.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{course.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary font-medium">{course.level}</span>
                <span>{course.lessons.length} lessons</span>
              </div>
              <Button className="mt-4 w-full" size="sm">
                Start Course <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </article>
          );
        })}
      </div>
    </>
  );
}

// Lesson detail view
function LessonView({ course, lessonIdx, onBack, onNext, onPrev }: {
  course: Course;
  lessonIdx: number;
  onBack: () => void;
  onNext: () => void;
  onPrev: () => void;
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

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted rounded-full mb-6">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${((lessonIdx + 1) / totalLessons) * 100}%` }}
        />
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-6 mb-6">
        <p className="text-foreground leading-relaxed text-base">{lesson.content}</p>
      </div>

      {lesson.fen && (
        <div className="mb-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 text-center">Position Example</p>
          <MiniBoard fen={lesson.fen} />
        </div>
      )}

      {lesson.keyPoints.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-6 mb-6">
          <h3 className="font-display text-sm font-semibold text-foreground mb-3">Key Takeaways</h3>
          <ul className="space-y-2">
            {lesson.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onPrev} disabled={lessonIdx === 0} className="flex-1">
          Previous
        </Button>
        <Button onClick={onNext} disabled={lessonIdx === totalLessons - 1} className="flex-1">
          {lessonIdx === totalLessons - 1 ? "Course Complete!" : "Next Lesson"}
          {lessonIdx < totalLessons - 1 && <ChevronRight className="ml-1 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

// Course detail view (lesson list)
function CourseDetail({ course, onBack, onSelectLesson }: {
  course: Course;
  onBack: () => void;
  onSelectLesson: (idx: number) => void;
}) {
  const Icon = ICON_MAP[course.icon] || BookOpen;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> All Courses
      </button>

      <div className="rounded-xl border border-border/50 bg-card p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="inline-flex rounded-lg bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
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
        {course.lessons.map((lesson, idx) => (
          <button
            key={lesson.id}
            onClick={() => onSelectLesson(idx)}
            className="w-full flex items-center gap-4 rounded-lg border border-border/50 bg-card p-4 hover:border-primary/30 hover:shadow-glow transition-all text-left"
          >
            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{lesson.title}</p>
              <p className="text-xs text-muted-foreground truncate">{lesson.keyPoints[0]}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
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
          <CourseList
            onSelectCourse={(course) => {
              setSelectedCourse(course);
              setView("course");
            }}
          />
        )}

        {view === "course" && selectedCourse && (
          <CourseDetail
            course={selectedCourse}
            onBack={() => setView("list")}
            onSelectLesson={(idx) => {
              setLessonIdx(idx);
              setView("lesson");
            }}
          />
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
