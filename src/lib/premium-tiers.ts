import { Crown, Zap, Shield, Trophy, Sparkles, Star, Target, Award, Users, MessageCircle, Gem, Play } from "lucide-react";

export type TierKey = "premium" | "pro" | "elite" | "grandmaster";

export interface PremiumTier {
  key: TierKey;
  name: string;
  price: string;
  priceId: string;
  productId: string;
  description: string;
  popular?: boolean;
  features: string[];
}

export const TIERS: PremiumTier[] = [
  {
    key: "premium",
    name: "Premium",
    price: "$4.99",
    priceId: "price_1T8kXqFlIJYoBTqwzUYKWWJR",
    productId: "prod_U6yUhNjEmM7u0n",
    description: "The essentials for serious players",
    features: [
      "Ad-free experience",
      "Strategy Lounge chat",
      "Unlimited puzzle history",
      "Basic game analytics",
      "Premium profile badge",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "$10",
    priceId: "price_1T8lMDFlIJYoBTqwJrD7qO98",
    productId: "prod_U6zKQ3MKEqmSIv",
    popular: true,
    description: "For players who want to improve fast",
    features: [
      "Everything in Premium",
      "Advanced daily puzzles",
      "Extra analytics tools",
      "Advanced video lessons",
      "Personalized puzzles",
    ],
  },
  {
    key: "elite",
    name: "Elite",
    price: "$15",
    priceId: "price_1T8lMvFlIJYoBTqwd1VDVnFo",
    productId: "prod_U6zLfLsAQnMk6L",
    description: "Compete at the highest level",
    features: [
      "Everything in Pro",
      "VIP tournaments access",
      "Special leaderboard",
      "Unique virtual trophies",
      "Elite profile badge",
    ],
  },
  {
    key: "grandmaster",
    name: "Grandmaster",
    price: "$20",
    priceId: "price_1T8lNsFlIJYoBTqwASgppie5",
    productId: "prod_U6zMJSNgr3DIBp",
    description: "The ultimate chess experience",
    features: [
      "Everything in Elite",
      "Private tournaments with friends",
      "Priority support",
      "Exclusive collectible rewards",
      "Grandmaster profile badge",
    ],
  },
];

export const TIER_HIERARCHY: TierKey[] = ["premium", "pro", "elite", "grandmaster"];

export function getTierByProductId(productId: string): TierKey | null {
  const tier = TIERS.find((t) => t.productId === productId);
  return tier?.key ?? null;
}

export function getTierLevel(tier: TierKey | null): number {
  if (!tier) return -1;
  return TIER_HIERARCHY.indexOf(tier);
}

export function hasAccess(userTier: TierKey | null, requiredTier: TierKey): boolean {
  return getTierLevel(userTier) >= getTierLevel(requiredTier);
}
