import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, ArrowLeft, Lock, Check, Sparkles, Gift } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { SHOP_ITEMS, RARITY_META, type ShopItem } from "@/lib/shop-data";
import { purchaseShopItem, getInventory } from "@/lib/coins";
import { emitReward } from "@/lib/reward-fx";
import { toast } from "@/hooks/use-toast";
import { getShopPreview } from "@/lib/shop-previews";
import BoardSwatch from "@/components/previews/BoardSwatch";
import PieceSetPreview from "@/components/previews/PieceSetPreview";

/**
 * Rewards page — boards & pieces, bought ONLY with coins.
 * No chests, no XP. Boards and pieces are split into clear sections,
 * every card is the same size, and each piece-set card shows the full
 * white AND black sets so you actually see what you're buying.
 */
export default function Chests() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState<ShopItem | null>(null);

  const coins = (profile as any)?.master_coins ?? 0;

  useEffect(() => {
    if (!user) return;
    getInventory(user.id).then((arr) => setOwned(new Set(arr)));
  }, [user]);

  const boards = useMemo(() => SHOP_ITEMS.filter((i) => i.type === "board"), []);
  const pieces = useMemo(() => SHOP_ITEMS.filter((i) => i.type === "pieces"), []);

  const handleBuy = async (item: ShopItem) => {
    if (!user) {
      navigate("/signup");
      return;
    }
    if (owned.has(item.key)) return;
    if (coins < item.price) {
      toast({
        title: "Not enough coins",
        description: `You need ${item.price - coins} more coins. Play a game to earn more!`,
        variant: "destructive",
      });
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
    emitReward({
      kind: "achievement",
      title: "Unlocked!",
      subtitle: item.name,
      rare: item.rarity === "legendary",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container max-w-6xl mx-auto px-4 pt-24 pb-24">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back home
          </Link>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold tracking-wider uppercase">
                <Gift className="w-3.5 h-3.5" /> Rewards
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-br from-amber-300 via-primary to-amber-500 bg-clip-text text-transparent">
                Boards & Pieces. Pure coin.
              </h1>
              <p
                className="mt-3 text-base text-muted-foreground italic max-w-xl"
                style={{ fontFamily: "Caveat, cursive", fontSize: "1.2rem" }}
              >
                "No mystery boxes. Pick exactly the board or set you want — you earned every coin." — Nikola, 13
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
          {!user && (
            <p className="mt-4 text-sm text-amber-400/90 bg-amber-400/10 border border-amber-400/30 rounded-lg px-3 py-2">
              Sign in to earn coins from real games and unlock these.
            </p>
          )}
        </div>

        <Section title="Boards" subtitle="Real palettes — exactly what appears in-game.">
          <Grid>
            {boards.map((item) => (
              <ItemCard
                key={item.key}
                item={item}
                owned={owned.has(item.key)}
                canAfford={coins >= item.price}
                busy={busyKey === item.key}
                hasUser={!!user}
                onBuy={() => handleBuy(item)}
              />
            ))}
          </Grid>
        </Section>

        <Section title="Pieces" subtitle="Full white and black sets shown on every card.">
          <Grid>
            {pieces.map((item) => (
              <ItemCard
                key={item.key}
                item={item}
                owned={owned.has(item.key)}
                canAfford={coins >= item.price}
                busy={busyKey === item.key}
                hasUser={!!user}
                onBuy={() => handleBuy(item)}
              />
            ))}
          </Grid>
        </Section>
      </main>

      <UnlockOverlay item={unlocking} onClose={() => setUnlocking(null)} />
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 first:mt-0">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr items-stretch">
      {children}
    </div>
  );
}

function ItemCard({
  item, owned, canAfford, busy, hasUser, onBuy,
}: {
  item: ShopItem;
  owned: boolean;
  canAfford: boolean;
  busy: boolean;
  hasUser: boolean;
  onBuy: () => void;
}) {
  const r = RARITY_META[item.rarity];
  const preview = getShopPreview(item.key, item.preview);
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`group relative rounded-2xl border border-border/40 bg-card overflow-hidden ring-1 ${r.ring} ${r.glow} transition flex flex-col h-full`}
    >
      <div className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/50 backdrop-blur ${r.color}`}>
        {r.label}
      </div>
      {owned && (
        <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
          <Check className="h-3 w-3" /> Owned
        </div>
      )}
      {/* Fixed-height preview area so every card is identical */}
      <div className="relative h-48 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex items-center justify-center overflow-hidden p-4">
        {preview.kind === "board" ? (
          <div className="w-full max-w-[160px]">
            <BoardSwatch light={preview.light} dark={preview.dark} size={8} />
          </div>
        ) : preview.kind === "pieces" ? (
          <div className="w-full max-w-[220px]">
            <PieceSetPreview style={preview.style} rich />
          </div>
        ) : (
          <div className="text-6xl">{preview.emoji}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>
      <div className="p-3 flex flex-col flex-1">
        <div className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</div>
        {item.blurb && (
          <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{item.blurb}</div>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-amber-300 font-bold text-sm">
            <Coins className="h-3.5 w-3.5" />
            {item.price.toLocaleString()}
          </div>
          <Button
            size="sm"
            disabled={owned || busy || (!owned && !canAfford && hasUser)}
            onClick={onBuy}
            className={`h-7 px-3 text-xs font-bold ${
              owned
                ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 cursor-default"
                : !hasUser
                ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:brightness-110"
                : canAfford
                ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:brightness-110"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {owned ? "Owned" : busy ? "..." : !hasUser ? "Sign up" : canAfford ? "Buy" : (
              <span className="flex items-center gap-1"><Lock className="h-3 w-3" />{item.price - 0}</span>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function UnlockOverlay({ item, onClose }: { item: ShopItem | null; onClose: () => void }) {
  if (!item) return null;
  const r = RARITY_META[item.rarity];
  const preview = getShopPreview(item.key, item.preview);
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
          <motion.div
            initial={{ rotateY: -180, scale: 0.6, opacity: 0 }}
            animate={{ rotateY: 0, scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className={`relative w-full max-w-sm rounded-3xl border border-amber-500/40 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 ${r.glow} p-7 text-center`}
          >
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-black/40 ${r.color}`}>
              <Sparkles className="h-3 w-3" /> {r.label} unlock
            </div>
            <div className="mt-5 flex items-center justify-center">
              {preview.kind === "board" ? (
                <div className="w-44"><BoardSwatch light={preview.light} dark={preview.dark} size={8} /></div>
              ) : preview.kind === "pieces" ? (
                <div className="w-64"><PieceSetPreview style={preview.style} rich /></div>
              ) : (
                <div className="text-8xl">{preview.emoji}</div>
              )}
            </div>
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
