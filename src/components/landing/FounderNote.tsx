// Handwritten "letter from the founder" — the most human moment on the page.
// Intentionally imperfect: slight rotation, paper-like texture, hand-drawn arrow,
// signature in Caveat. Sits between the polished luxury sections like a torn
// page someone left on the desk.
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function FounderNote() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30, rotate: -0.6 }}
      whileInView={{ opacity: 1, y: 0, rotate: -0.4 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative max-w-2xl mx-auto my-10"
      aria-label="A note from the founder"
    >
      {/* Tape strip */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 rounded-sm opacity-70 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, hsl(43 80% 75% / 0.45), hsl(43 70% 60% / 0.25))",
          boxShadow: "0 2px 4px hsl(0 0% 0% / 0.3), inset 0 0 12px hsl(43 90% 80% / 0.25)",
          transform: "rotate(-3deg)",
        }}
      />

      <div
        className="relative rounded-[6px] border border-primary/15 px-7 py-8 sm:px-10 sm:py-10 backdrop-blur-md"
        style={{
          background:
            "linear-gradient(140deg, hsl(40 25% 12% / 0.85) 0%, hsl(30 20% 8% / 0.85) 60%, hsl(35 22% 10% / 0.85) 100%)",
          backgroundImage:
            "radial-gradient(circle at 12% 18%, hsl(43 60% 50% / 0.05) 0px, transparent 60px), radial-gradient(circle at 88% 82%, hsl(43 60% 50% / 0.04) 0px, transparent 80px)",
          boxShadow:
            "0 30px 60px -20px hsl(0 0% 0% / 0.6), inset 0 1px 0 hsl(43 60% 70% / 0.06)",
        }}
      >
        {/* Coffee-ring stain, top right */}
        <svg
          aria-hidden
          className="absolute -top-2 right-8 w-14 h-14 opacity-25 pointer-events-none"
          viewBox="0 0 100 100" fill="none"
        >
          <ellipse cx="50" cy="50" rx="38" ry="36" stroke="hsl(28 60% 40%)" strokeWidth="2.5" />
          <ellipse cx="50" cy="50" rx="32" ry="30" stroke="hsl(28 60% 35%)" strokeWidth="1" opacity="0.6" />
        </svg>

        <p className="font-hand text-primary/90 text-xl sm:text-2xl leading-none mb-3 -rotate-1">
          a quick note —
        </p>

        <div className="font-display text-foreground/90 text-[15px] sm:text-[17px] leading-relaxed space-y-3">
          <p>
            I'm 13. I build this site by myself, after school, while the normal
            kids are outside. No team, no manager, no investors. Just me, one
            laptop, and way too many ideas about chess.
          </p>
          <p>
            Chess.com and Lichess are great — but they feel like they were built
            by people who don't actually sit down and play. I wanted a place
            that feels like it was made by someone it actually <em>matters</em> to.
          </p>
          <p>
            If something breaks, tell me. If something feels good, tell me that
            too. I read every message myself.
          </p>
        </div>

        {/* Signature block */}
        <div className="mt-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="font-hand text-primary text-3xl sm:text-4xl leading-none">Nikola</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
              Nikola Šakotić · founder, age 13
            </p>
          </div>

          <Link
            to="/contact"
            className="group inline-flex items-center gap-1.5 font-hand text-primary text-xl hover:text-primary/80 transition-colors"
          >
            write to me
            {/* hand-drawn arrow */}
            <svg width="42" height="14" viewBox="0 0 42 14" fill="none" aria-hidden
              className="group-hover:translate-x-1 transition-transform">
              <path
                d="M2 7 Q 14 4, 26 8 T 38 7 M 32 3 L 38 7 L 33 12"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"
              />
            </svg>
          </Link>
        </div>

        {/* Margin scribble bottom-left */}
        <p className="absolute -bottom-2 left-6 font-hand text-muted-foreground/60 text-sm -rotate-2 select-none pointer-events-none">
          p.s. thanks for scrolling this far — really
        </p>
      </div>
    </motion.section>
  );
}
