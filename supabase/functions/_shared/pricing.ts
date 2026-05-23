// Server-side authoritative pricing. Clients MUST NOT control payment amounts.
// All amounts are in the smallest currency unit (cents).
export type ItemType = "course" | "tournament" | "donation";

export interface PricedItem {
  amount: number; // cents
  currency: string;
  productName: string;
}

const PRICE_TABLE: Record<string, PricedItem> = {
  // course:<itemId>
  "course:premium-course": { amount: 1999, currency: "usd", productName: "Premium Course" },
  "course:opening-mastery": { amount: 2999, currency: "usd", productName: "Opening Mastery Course" },
  "course:endgame-essentials": { amount: 2499, currency: "usd", productName: "Endgame Essentials Course" },
  // tournament:<itemId>
  "tournament:weekend-arena": { amount: 500, currency: "usd", productName: "Weekend Arena Entry" },
  "tournament:masters-cup": { amount: 2500, currency: "usd", productName: "Masters Cup Entry" },
};

const DONATION_MIN = 100;     // $1.00
const DONATION_MAX = 50000;   // $500.00

export function lookupPrice(
  itemType: string | undefined,
  itemId: string | undefined,
  clientAmount: number | undefined,
  clientCurrency: string | undefined,
): PricedItem | { error: string } {
  if (!itemType) return { error: "itemType is required" };

  if (itemType === "donation") {
    const amt = Math.floor(Number(clientAmount ?? 0));
    if (!Number.isFinite(amt) || amt < DONATION_MIN || amt > DONATION_MAX) {
      return { error: `Donation amount must be between ${DONATION_MIN} and ${DONATION_MAX} cents` };
    }
    const currency = (clientCurrency ?? "usd").toLowerCase();
    if (!/^[a-z]{3}$/.test(currency)) return { error: "Invalid currency" };
    return { amount: amt, currency, productName: "Donation to MasterChess" };
  }

  if (itemType !== "course" && itemType !== "tournament") {
    return { error: "Unsupported itemType" };
  }
  if (!itemId) return { error: "itemId is required" };

  const entry = PRICE_TABLE[`${itemType}:${itemId}`];
  if (!entry) return { error: "Unknown item" };
  return entry;
}
