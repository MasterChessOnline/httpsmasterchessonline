// Client helpers for the coin economy. All amounts are computed server-side
// via the RPCs `award_bot_game_coins`, `award_online_game_coins`,
// `purchase_shop_item` — clients NEVER mint coins locally.

import { supabase } from "@/integrations/supabase/client";
import { emitReward } from "@/lib/reward-fx";

const WIN_STREAK_KEY = "mc:winstreak";

export function getWinStreak(): number {
  try { return Number(localStorage.getItem(WIN_STREAK_KEY) || 0); } catch { return 0; }
}
export function bumpWinStreak(result: "win" | "loss" | "draw"): number {
  const cur = getWinStreak();
  const next = result === "win" ? cur + 1 : 0;
  try { localStorage.setItem(WIN_STREAK_KEY, String(next)); } catch {}
  return next;
}

export interface CoinAward {
  ok: boolean;
  total?: number;
  base?: number;
  streak_bonus?: number;
  first_win_bonus?: number;
  balance?: number;
  error?: string;
  already?: boolean;
  outcome?: "win" | "loss" | "draw";
  opp_rating?: number;
  my_rating?: number;
}

export async function awardBotCoins(opts: {
  botRating: number;
  result: "win" | "loss" | "draw";
  winStreak: number;
}): Promise<CoinAward> {
  const { data, error } = await (supabase.rpc as any)("award_bot_game_coins", {
    p_bot_rating: opts.botRating,
    p_result: opts.result,
    p_win_streak: opts.winStreak,
  });
  if (error) return { ok: false, error: error.message };
  const res = data as CoinAward;
  if (res?.ok && res.total) {
    if (res.first_win_bonus) {
      emitReward({ kind: "achievement", title: "First Win of the Day!", subtitle: `+${res.first_win_bonus} bonus coins`, rare: true });
    }
    emitReward({ kind: "coin", title: `+${res.total} Coins`, subtitle: res.streak_bonus ? `Streak bonus +${res.streak_bonus}` : undefined, amount: res.total });
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("mc:coins-changed"));
    if (opts.result === "win") contributeClanQuest("team_wins", 1);
  }
  return res;
}

export async function awardOnlineCoins(opts: {
  gameId: string;
  winStreak: number;
}): Promise<CoinAward> {
  const { data, error } = await (supabase.rpc as any)("award_online_game_coins", {
    p_game_id: opts.gameId,
    p_win_streak: opts.winStreak,
  });
  if (error) return { ok: false, error: error.message };
  const res = data as CoinAward;
  if (res?.ok && !res.already && res.total) {
    if (res.first_win_bonus) {
      emitReward({ kind: "achievement", title: "First Win of the Day!", subtitle: `+${res.first_win_bonus} bonus coins`, rare: true });
    }
    emitReward({ kind: "coin", title: `+${res.total} Coins`, subtitle: res.streak_bonus ? `Streak bonus +${res.streak_bonus}` : undefined, amount: res.total });
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("mc:coins-changed"));
  }
  return res;
}

export async function purchaseShopItem(opts: {
  key: string;
  type: string;
  price: number;
}): Promise<{ ok: boolean; balance?: number; error?: string; needed?: number }> {
  const { data, error } = await (supabase.rpc as any)("purchase_shop_item", {
    p_item_key: opts.key,
    p_item_type: opts.type,
    p_price: opts.price,
  });
  if (error) return { ok: false, error: error.message };
  if ((data as any)?.ok && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("mc:coins-changed"));
  }
  return data as any;
}

export async function getInventory(userId: string): Promise<string[]> {
  const { data } = await (supabase as any).from("user_inventory")
    .select("item_key")
    .eq("user_id", userId);
  return ((data as any[]) ?? []).map((r) => r.item_key);
}

/** Paid wheel spin (100 coins). Server returns the random reward + new balance. */
export async function paidSpinWheel(): Promise<{ ok: boolean; coins?: number; cost?: number; new_balance?: number; error?: string; needed?: number }> {
  const { data, error } = await (supabase.rpc as any)("spin_wheel_paid");
  if (error) return { ok: false, error: error.message };
  const r = data as any;
  if (r?.ok) {
    emitReward({ kind: "coin", title: `+${r.coins} Coins`, subtitle: `Spin cost ${r.cost} · net +${r.coins - r.cost}`, amount: r.coins });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("mc:coins-changed"));
      window.dispatchEvent(new CustomEvent("mc:spin-claimed"));
    }
  }
  return r;
}

/** Trigger referral first-games bonus check (no-op if already paid / not enough games). */
export async function claimReferralFirstGames(): Promise<void> {
  try {
    const { data } = await (supabase.rpc as any)("claim_referral_first_games");
    if ((data as any)?.referrer_bonus && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("mc:coins-changed"));
    }
  } catch {}
}
