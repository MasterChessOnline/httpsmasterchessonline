import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, ArrowLeft, Lock, Check, Sparkles, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { SHOP_ITEMS, SHOP_CATEGORIES, RARITY_META, type ShopItem, type ShopItemType } from "@/lib/shop-data";
import { purchaseShopItem, getInventory } from "@/lib/coins";
import { emitReward } from "@/lib/reward-fx";
import { toast } from "@/hooks/use-toast";
import { getShopPreview } from "@/lib/shop-previews";
import BoardSwatch from "@/components/previews/BoardSwatch";
import PieceSetPreview from "@/components/previews/PieceSetPreview";

export default function Shop() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [cat, setCat] = useState<ShopItemType | "all">("all");
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState<ShopItem | null>(null);

  const coins = (profile as any)?.master_coins ?? 0;

  useEffect(() => {
    if (!user) return;
    getInventory(user.id).then((arr) => setOwned(new Set(arr)));
  }, [user]);

  const items = useMemo(
    () => (cat === "all" ? SHOP_ITEMS : SHOP_ITEMS.filter((i) => i.type === cat)),
    [cat]
  );

  const handleBuy = async (item: ShopItem) => {
    if (!user) {
      navigate("/signup");
      return;
    }
    if (owned.has(item.key)) return;
    if (coins < item.price) {
      toast({ title: "Not enough coins", description: `You need ${item.price - coins} more coins. Play a game to earn more!`, variant: "destructive" });
      return;
    }
    setBusyKey(item.key);
    const res = await purchaseShopItem({ key: item.key, type: item.type, price: item.price });
    setBusyKey(null);
    if (!res.ok) {
      toast({ title: "Purchase failed", description: res.error || "Try again", variant: "destructive" });
      return;
    }
    setOwned((prev) => new Set([...prev, item.key]));
    await refreshProfile();
    setUnlocking(item);
    emitReward({ kind: "achievement", title: "Unlocked!", subtitle: item.name, rare: item.rarity === "legendary" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container max-w-6xl mx-auto px-4 pt-20 md:pt-24 pb-28">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Back home
          </Link>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold tracking-wider uppercase">
                <ShoppingBag className="w-3.5 h-3.5" /> MasterChess Shop
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight bg-gradient-to-br from-amber-300 via-primary to-amber-500 bg-clip-text text-transparent">
                Boards. Pieces. Effects. Glory.
              </h1>
              <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-xl">
                Spend coins you've earned in real games. Every cosmetic is permanent — once it's yours, it's yours.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <Coins className="h-5 w-5 text-amber-400" />
              <div>
                <div className="text-xs uppercase tracking-wider text-amber-200/70">Balance</div>
                <div className="text-2xl font-bold text-amber-300 leading-none">{coins.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6 -mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {SHOP_CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCat(c.key as any)}
                className={`px-3.5 py-2 rounded-full border text-xs font-semibold uppercase tracking-wider transition whitespace-nowrap ${
                  cat === c.key
                    ? "border-amber-400/60 bg-amber-500/15 text-amber-300 shadow-[0_0_20px_hsl(43,95%,55%,0.25)]"
                    : "border-border/40 bg-card text-muted-foreground hover:text-foreground hover:border-amber-500/30"
                }`}
              >
                <span className="mr-1.5">{c.icon}</span>{c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 auto-rows-fr items-stretch">
          {items.map((item) => {
            const r = RARITY_META[item.rarity];
            const isOwned = owned.has(item.key);
            const canAfford = coins >= item.price;
            const busy = busyKey === item.key;
            const preview = getShopPreview(item.key, item.preview);
            return (
              <motion.div
                key={item.key}
                whileHover={{ y: -4 }}
                className={`group relative rounded-2xl border border-border/40 bg-card overflow-hidden ring-1 ${r.ring} ${r.glow} transition flex flex-col h-full`}
              >
                {/* Rarity tag */}
                <div className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/50 backdrop-blur ${r.color}`}>
                  {r.label}
                </div>
                {isOwned && (
                  <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Owned
                  </div>
                )}
                {/* Preview — real board / real pieces / fallback emoji */}
                <div className="relative h-36 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex items-center justify-center overflow-hidden p-3">
                  {preview.kind === "board" ? (
                    <div className="w-full max-w-[120px]">
                      <BoardSwatch light={preview.light} dark={preview.dark} size={6} />
                    </div>
                  ) : preview.kind === "pieces" ? (
                    <div className="w-full max-w-[150px]">
                      <PieceSetPreview style={preview.style} />
                    </div>
                  ) : (
                    <motion.div
                      animate={{ y: [0, -6, 0], rotate: [0, -3, 3, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="text-6xl drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
                    >
                      {preview.emoji}
                    </motion.div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <div className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</div>
                  {item.blurb && <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{item.blurb}</div>}
                  <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-amber-300 font-bold text-sm">
                      <Coins className="h-3.5 w-3.5" />
                      {item.price.toLocaleString()}
                    </div>
                    <Button
                      size="sm"
                      disabled={isOwned || busy || (!isOwned && !canAfford && !!user)}
                      onClick={() => handleBuy(item)}
                      className={`h-7 px-3 text-xs font-bold ${
                        isOwned
                          ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 cursor-default"
                          : !user
                          ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:brightness-110"
                          : canAfford
                          ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:brightness-110"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isOwned ? "Owned" : busy ? "..." : !user ? "Sign up" : canAfford ? "Buy" : (
                        <span className="flex items-center gap-1"><Lock className="h-3 w-3" />{item.price - coins}</span>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* 3D unlock animation */}
      <UnlockOverlay item={unlocking} onClose={() => setUnlocking(null)} />
    </div>
  );
}

function UnlockOverlay({ item, onClose }: { item: ShopItem | null; onClose: () => void }) {
  if (!item) return null;
  const r = RARITY_META[item.rarity];
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[350] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
          {/* Confetti */}
          {Array.from({ length: 28 }).map((_, i) => (
            <motion.div
              key={i}
              aria-hidden
              className="absolute h-2 w-2 rounded-sm"
              style={{
                left: "50%",
                top: "50%",
                background: ["#fbbf24", "#f59e0b", "#fde68a", "#a78bfa", "#22d3ee"][i % 5],
              }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{
                x: (Math.random() - 0.5) * 700,
                y: (Math.random() - 0.5) * 700,
                opacity: 0,
                rotate: Math.random() * 720,
              }}
              transition={{ duration: 1.6 + Math.random(), ease: "easeOut" }}
            />
          ))}
          <motion.div
            initial={{ rotateY: -180, scale: 0.6, opacity: 0 }}
            animate={{ rotateY: 0, scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className={`relative w-full max-w-sm rounded-3xl border border-amber-500/40 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 ${r.glow} p-7 text-center`}
            style={{ perspective: 1000 }}
          >
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-black/40 ${r.color}`}>
              <Sparkles className="h-3 w-3" /> {r.label} unlock
            </div>
            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="mt-4 text-8xl"
              style={{ transformStyle: "preserve-3d" }}
            >
              {item.preview}
            </motion.div>
            <h3 className="mt-4 text-2xl font-bold text-white">{item.name}</h3>
            <p className="mt-1 text-sm text-zinc-400">{item.blurb || "Permanently added to your collection."}</p>
            <Button
              onClick={onClose}
              className="mt-5 w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold hover:brightness-110"
            >
              Awesome!
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
