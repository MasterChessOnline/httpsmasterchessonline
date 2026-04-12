import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Youtube, Play, X, ExternalLink, Search, Filter, Clock, Eye, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VIDEO_LESSONS, type VideoLesson } from "@/lib/video-lessons-data";
import { Link } from "react-router-dom";

const CATEGORIES = ["all", "openings", "tactics", "endgames", "strategy"] as const;
const LEVELS = ["all", "beginner", "intermediate", "advanced"] as const;

/* ── Video Card ── */
const VideoCard = ({ video, onPlay }: { video: VideoLesson; onPlay: (v: VideoLesson) => void }) => (
  <motion.button
    onClick={() => onPlay(video)}
    className="group text-left rounded-xl border border-border/30 bg-card/50 overflow-hidden hover:border-red-500/30 hover:bg-card/70 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/40"
    whileHover={{ y: -4 }}
    transition={{ duration: 0.25 }}
  >
    {/* Thumbnail */}
    <div className="relative aspect-video overflow-hidden">
      <img
        src={video.thumbnail}
        alt={video.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      {/* Play overlay */}
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)] scale-90 group-hover:scale-100 transition-transform duration-300">
          <Play className="h-6 w-6 text-white fill-white ml-0.5" />
        </div>
      </div>
      {/* Duration */}
      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] px-2 py-0.5 rounded font-mono">
        {video.duration}
      </span>
      {/* Difficulty badge */}
      <span className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full font-semibold backdrop-blur-sm ${
        video.difficulty === "beginner" ? "bg-green-500/20 text-green-300 border border-green-500/30" :
        video.difficulty === "intermediate" ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" :
        "bg-red-500/20 text-red-300 border border-red-500/30"
      }`}>
        {video.difficulty}
      </span>
    </div>
    {/* Info */}
    <div className="p-3.5">
      <p className="text-[11px] text-red-400 font-medium uppercase tracking-wider mb-1">{video.category}</p>
      <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-red-400 transition-colors leading-snug">
        {video.title}
      </h3>
      <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{video.description}</p>
    </div>
  </motion.button>
);

/* ── Video Modal ── */
const VideoModal = ({ video, onClose }: { video: VideoLesson; onClose: () => void }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
    <motion.div
      className="relative w-full max-w-4xl rounded-2xl overflow-hidden border border-border/30 bg-card shadow-2xl"
      initial={{ scale: 0.9, y: 30 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.95, y: 20 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
      >
        <X className="h-5 w-5 text-white" />
      </button>
      <div className="aspect-video">
        <iframe
          src={video.videoUrl + "?autoplay=1"}
          title={video.title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="font-display text-lg font-bold text-foreground mb-1">{video.title}</h3>
        <p className="text-sm text-muted-foreground">{video.description}</p>
      </div>
    </motion.div>
  </motion.div>
);

/* ── Main Section ── */
const WatchAndImprove = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeLevel, setActiveLevel] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [playingVideo, setPlayingVideo] = useState<VideoLesson | null>(null);
  const [showAll, setShowAll] = useState(false);

  const filtered = VIDEO_LESSONS.filter(v => {
    if (activeCategory !== "all" && v.category !== activeCategory) return false;
    if (activeLevel !== "all" && v.difficulty !== activeLevel) return false;
    if (search && !v.title.toLowerCase().includes(search.toLowerCase()) && !v.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const displayed = showAll ? filtered : filtered.slice(0, 6);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base sm:text-lg font-bold text-foreground flex items-center gap-2.5 tracking-wide">
          <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <Youtube className="h-4 w-4 text-red-400" />
          </div>
          Watch & Improve
        </h2>
        <Link to="/coming-soon" className="text-xs text-red-400 hover:underline flex items-center gap-0.5 font-medium">
          More <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border/30 bg-card/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-red-500/40 transition-colors"
          />
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all duration-200 ${
                activeCategory === c
                  ? "bg-red-500/15 text-red-400 border border-red-500/30"
                  : "bg-muted/20 text-muted-foreground border border-border/20 hover:bg-muted/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Level filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {LEVELS.map(l => (
            <button
              key={l}
              onClick={() => setActiveLevel(l)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all duration-200 ${
                activeLevel === l
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-muted/20 text-muted-foreground border border-border/20 hover:bg-muted/30"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayed.map((video, i) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
          >
            <VideoCard video={video} onPlay={setPlayingVideo} />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No videos match your filters. Try adjusting your search.
        </div>
      )}

      {/* Show More */}
      {!showAll && filtered.length > 6 && (
        <div className="text-center">
          <Button variant="outline" onClick={() => setShowAll(true)} className="border-border/30 hover:border-red-500/30 hover:text-red-400">
            Show All Videos ({filtered.length})
          </Button>
        </div>
      )}

      {/* Channel Promotion */}
      <div className="rounded-xl border border-red-500/20 bg-gradient-to-r from-red-500/5 via-red-500/10 to-red-500/5 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/25 shrink-0">
            <Youtube className="h-7 w-7 text-red-400" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-display text-base font-bold text-foreground mb-1">
              Support MasterChess
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Subscribe and support daily chess content — openings, tactics, analysis & more.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a href="https://www.youtube.com/@DailyChess_12" target="_blank" rel="noopener noreferrer">
                <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-300 hover:shadow-[0_0_25px_rgba(239,68,68,0.3)] hover:scale-105">
                  <Youtube className="h-4 w-4 mr-2" />
                  Subscribe on YouTube
                  <ExternalLink className="h-3.5 w-3.5 ml-2 opacity-60" />
                </Button>
              </a>
              <Link to="/coming-soon">
                <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/40">
                  <Play className="h-4 w-4 mr-2" />
                  Explore More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {playingVideo && <VideoModal video={playingVideo} onClose={() => setPlayingVideo(null)} />}
      </AnimatePresence>
    </section>
  );
};

export default WatchAndImprove;
