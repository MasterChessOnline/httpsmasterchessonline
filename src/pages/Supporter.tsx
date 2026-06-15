import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Coffee, Crown, Sparkles, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DonationProgressBar from "@/components/DonationProgressBar";

interface Tier {
  id: string;
  name: string;
  amount: number; // cents
  icon: any;
  perks: string[];
  highlight?: boolean;
}

const TIERS: Tier[] = [
  {
    id: "coffee",
    name: "Coffee",
    amount: 300,
    icon: Coffee,
    perks: ["Supporter badge on profile", "Eternal gratitude from a 13-year-old", "Helps cover server costs"],
  },
  {
    id: "gold",
    name: "Gold",
    amount: 1000,
    icon: Sparkles,
    highlight: true,
    perks: ["Gold supporter badge", "Name in /supporters wall", "Early access to new features"],
  },
  {
    id: "legend",
    name: "Legend",
    amount: 2500,
    icon: Crown,
    perks: ["Legendary aura on profile", "Direct DM line to Nikola", "Vote on next feature"],
  },
];

export default function Supporter() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  async function donate(amountCents: number, label: string) {
    if (amountCents < 100) {
      toast({ title: "Minimum is $1", variant: "destructive" });
      return;
    }
    setLoading(label);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          itemType: "donation",
          itemId: label,
          amount: amountCents,
          currency: "usd",
          returnUrl: window.location.origin,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (e: any) {
      toast({ title: "Could not start checkout", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Support MasterChess — Keep the Servers Alive</title>
        <meta
          name="description"
          content="MasterChess is built by a 13-year-old. No ads, no paywall. If the site helped you, you can tip the project — every dollar goes to servers and new features."
        />
        <link rel="canonical" href="/supporter" />
      </Helmet>

      <main className="container mx-auto max-w-5xl px-4 py-16">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs uppercase tracking-widest text-primary mb-6">
            <Heart className="h-3.5 w-3.5" /> No paywall, ever
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Support the project
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            I'm Nikola, 13, and I run MasterChess after school. No ads, no premium walls — just servers
            that need paying. Tip whatever feels right.
          </p>
          <DonationProgressBar variant="card" />
        </motion.header>


        <div className="grid md:grid-cols-3 gap-5">
          {TIERS.map((t, i) => {
            const Icon = t.icon;
            const isLoading = loading === t.id;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i }}
              >
                <Card
                  className={`relative h-full p-6 flex flex-col ${
                    t.highlight
                      ? "border-primary/60 shadow-[0_0_40px_-12px_hsl(var(--primary)/0.5)]"
                      : "border-border/60"
                  }`}
                >
                  {t.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                      Most loved
                    </div>
                  )}
                  <Icon className={`h-9 w-9 mb-4 ${t.highlight ? "text-primary" : "text-muted-foreground"}`} />
                  <h2 className="text-2xl font-bold">{t.name}</h2>
                  <p className="text-4xl font-extrabold mt-2">
                    ${(t.amount / 100).toFixed(0)}
                    <span className="text-sm font-normal text-muted-foreground"> one-time</span>
                  </p>
                  <ul className="mt-5 space-y-2 text-sm text-muted-foreground flex-1">
                    {t.perks.map((p) => (
                      <li key={p} className="flex gap-2">
                        <span className="text-primary">✦</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="lg"
                    className="mt-6 w-full"
                    variant={t.highlight ? "default" : "outline"}
                    onClick={() => donate(t.amount, t.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      `Tip $${(t.amount / 100).toFixed(0)}`
                    )}
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 max-w-md mx-auto"
        >
          <Card className="p-6 border-border/60">
            <h3 className="text-lg font-semibold mb-2">Custom amount</h3>
            <p className="text-sm text-muted-foreground mb-4">Pick your own number. Anything from $1 up.</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  step={1}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="5"
                  className="pl-7"
                />
              </div>
              <Button
                onClick={() => donate(Math.round(Number(customAmount) * 100), "custom")}
                disabled={loading === "custom" || !customAmount}
              >
                {loading === "custom" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send tip"}
              </Button>
            </div>
          </Card>
        </motion.div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Secure checkout by Stripe · No subscription · Cancel-anytime is irrelevant because there's nothing to cancel
        </p>
      </main>
    </div>
  );
}
