import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Coins, ChevronRight } from "lucide-react";
import { SHOP_ITEMS, RARITY_META } from "@/lib/shop-data";

/**
 * Compact Shop teaser strip for the homepage.
 * Picks 6 standout items and links to /shop. Lightweight (no data fetch).
 */
const FEATURED_KEYS = [
  "board:universe_animated",
  "pieces:celestial",
  "board:cosmic_nebula",
  "pieces:dragon",
  "effect:legendary_aura",
  "board:aurora_borealis",
];

export default function ShopHomeStrip() {
  const items = FEATURED_KEYS
    .map((k) => SHOP_ITEMS.find((i) => i.key === k))
    .filter(Boolean) as typeof SHOP_ITEMS;

  return (
    <section className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-zinc-950/80 via-black/60 to-zinc-950/80 backdrop-blur-sm p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/30">
            <ShoppingBag className="h-4 w-4 text-amber-300" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold leading-none">Shop</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Boards · Pieces · Effects</p>
          </div>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200"
        >
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {items.map((it, i) => {
          const meta = RARITY_META[it.rarity];
          return (
            <motion.div
              key={it.key}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Link
                to="/shop"
                className={`group relative flex flex-col items-center justify-center aspect-square rounded-2xl border bg-card/60 hover:bg-card/90 transition ${meta.ring} ring-1`}
              >
                <span className="text-3xl sm:text-4xl drop-shadow">{it.preview}</span>
                <span className="absolute top-1 right-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur ${meta.color}">
                  {meta.label.charAt(0)}
                </span>
                <span className="absolute bottom-1 left-1 right-1 flex items-center justify-center gap-0.5 text-[10px] font-bold text-amber-300">
                  <Coins className="h-2.5 w-2.5" />
                  {it.price.toLocaleString()}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
