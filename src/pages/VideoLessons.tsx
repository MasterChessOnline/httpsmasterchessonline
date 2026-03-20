import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VIDEO_LESSONS, VideoLesson } from "@/lib/video-lessons-data";
import { Play, Clock } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "openings", label: "Openings" },
  { value: "endgames", label: "Endgames" },
  { value: "tactics", label: "Tactics" },
  { value: "strategy", label: "Strategy" },
];

const DIFFICULTIES = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const difficultyColor: Record<string, string> = {
  beginner: "bg-accent/20 text-accent-foreground",
  intermediate: "bg-primary/20 text-primary",
  advanced: "bg-destructive/20 text-destructive",
};

const VideoLessons = () => {
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null);

  const filtered = VIDEO_LESSONS.filter((v) => {
    if (category !== "all" && v.category !== category) return false;
    if (difficulty !== "all" && v.difficulty !== difficulty) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-6xl">
        <div className="text-center mb-8">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-3">
            <Play className="w-3 h-3 mr-1" /> Video Library
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Master Class <span className="text-gradient-gold">Lessons</span>
          </h1>
          <p className="text-muted-foreground mt-2">Learn from curated video lessons covering every aspect of chess.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-all ${
                category === c.value ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              onClick={() => setDifficulty(d.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${
                difficulty === d.value ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Video modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
            <div className="bg-card border border-border rounded-xl max-w-3xl w-full p-4" onClick={(e) => e.stopPropagation()}>
              <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                <iframe
                  src={selectedVideo.videoUrl}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  title={selectedVideo.title}
                />
              </div>
              <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>{selectedVideo.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{selectedVideo.description}</p>
              <Button onClick={() => setSelectedVideo(null)} variant="outline" className="mt-3">Close</Button>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all group cursor-pointer"
              onClick={() => setSelectedVideo(lesson)}
            >
              <div className="relative aspect-video bg-muted">
                <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-background/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-12 h-12 text-primary" />
                </div>
                <span className="absolute bottom-2 right-2 bg-background/80 text-foreground text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {lesson.duration}
                </span>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${difficultyColor[lesson.difficulty]}`}>
                    {lesson.difficulty}
                  </span>
                  <span className="text-[10px] text-muted-foreground capitalize">{lesson.category}</span>
                </div>
                <h3 className="text-sm font-semibold line-clamp-2">{lesson.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{lesson.description}</p>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No lessons match your filters.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default VideoLessons;
