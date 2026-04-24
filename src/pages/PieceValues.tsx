import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Info, Crown, Sparkles } from "lucide-react";

const PIECES = [
  { name: "Pawn", symbol: "♙", value: 1, color: "text-green-400", bg: "bg-green-500/10", desc: "The soul of chess. Promotes to queen on the 8th rank.", tips: ["Control center with e/d pawns", "Connected pawns are strong", "Passed pawns must be pushed"] },
  { name: "Knight", symbol: "♘", value: 3, color: "text-blue-400", bg: "bg-blue-500/10", desc: "The tricky piece. Jumps in an L-shape, can't be blocked.", tips: ["Strong on outpost squares", "Best in closed positions", "Fork specialists"] },
  { name: "Bishop", symbol: "♗", value: 3, color: "text-purple-400", bg: "bg-purple-500/10", desc: "The sniper. Controls long diagonals and excels in open positions.", tips: ["Bishop pair is very strong", "Best in open positions", "Place pawns on opposite color"] },
  { name: "Rook", symbol: "♖", value: 5, color: "text-orange-400", bg: "bg-orange-500/10", desc: "The heavy artillery. Dominates open files and the 7th rank.", tips: ["Double rooks on open files", "Rook on 7th rank is deadly", "Active rooks > passive rooks"] },
  { name: "Queen", symbol: "♕", value: 9, color: "text-primary", bg: "bg-primary/10", desc: "The most powerful piece. Combines rook and bishop movement.", tips: ["Don't develop too early", "Centralize in the middlegame", "Deadly with minor piece support"] },
  { name: "King", symbol: "♔", value: "∞", color: "text-primary", bg: "bg-primary/10", desc: "The game — lose it and you lose. Fighting piece in endgames.", tips: ["Castle early for safety", "Active king in endgames", "Keep pawn shield intact"] },
];

const EXCHANGES = [
  { trade: "Knight ↔ Bishop", verdict: "≈ Equal", note: "Bishops slightly better in open positions, knights in closed." },
  { trade: "Rook ↔ Bishop + Pawn", verdict: "≈ Equal", note: "The 'exchange'. Rook is slightly better in open positions." },
  { trade: "Queen ↔ 2 Rooks", verdict: "2 Rooks ≥", note: "Two rooks are often stronger, especially with open files." },
  { trade: "Queen ↔ 3 Minor Pieces", verdict: "3 Pieces ≥", note: "Three pieces coordinate well and control more squares." },
  { trade: "Rook ↔ 2 Minor Pieces", verdict: "2 Pieces ≥", note: "Two pieces usually beat a rook in the middlegame." },
];

const PieceValues = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
      <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Badge className="bg-primary/20 text-primary border-primary/30 mb-3">
          <Crown className="w-3 h-3 mr-1" /> Reference
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold font-display">
          Piece <span className="text-gradient-gold">Values</span> & Exchange Guide
        </h1>
        <p className="text-muted-foreground mt-2">Know what every piece is worth and when to trade.</p>
      </motion.div>

      {/* Pieces Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {PIECES.map((piece, i) => (
          <motion.div
            key={piece.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border/50 bg-card h-full hover:border-primary/30 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{piece.symbol}</span>
                  <div>
                    <h3 className="font-display font-bold text-foreground">{piece.name}</h3>
                    <span className={`font-mono text-lg font-bold ${piece.color}`}>
                      {piece.value === "∞" ? "∞" : `${piece.value} pts`}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{piece.desc}</p>
                <div className="space-y-1.5">
                  {piece.tips.map((tip) => (
                    <div key={tip} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Sparkles className="w-3 h-3 text-primary shrink-0" />
                      {tip}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Exchange Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Info className="w-5 h-5 text-primary" /> Common Exchanges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {EXCHANGES.map((ex) => (
                <div key={ex.trade} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-muted/30 rounded-lg border border-border/20 px-4 py-3">
                  <span className="font-mono text-sm font-bold text-foreground min-w-[200px]">{ex.trade}</span>
                  <Badge variant="outline" className="w-fit text-[10px] shrink-0">{ex.verdict}</Badge>
                  <span className="text-xs text-muted-foreground">{ex.note}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
    <Footer />
  </div>
);

export default PieceValues;
