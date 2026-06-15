import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Heart, Loader2, Crown, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<"loading" | "ok" | "pending" | "error">("loading");
  const [amount, setAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>("usd");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { sessionId },
        });
        if (error) throw error;
        if (data?.success) {
          setAmount(data.amount ?? null);
          setCurrency(data.currency ?? "usd");
          setStatus("ok");
        } else {
          setStatus("pending");
        }
      } catch {
        setStatus("error");
      }
    })();
  }, [sessionId]);

  const pretty =
    amount != null
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100)
      : null;

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <Helmet>
        <title>Thank you — MasterChess</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full rounded-2xl border border-primary/30 bg-card/70 backdrop-blur p-8 text-center"
      >
        {status === "loading" && (
          <>
            <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary mb-4" />
            <h1 className="text-2xl font-bold">Confirming your payment…</h1>
          </>
        )}

        {status === "ok" && (
          <>
            <motion.div
              initial={{ scale: 0.6, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
              className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary mb-5"
            >
              <Heart className="h-8 w-8" fill="currentColor" />
            </motion.div>
            <h1 className="text-3xl font-extrabold tracking-tight">Thank you{pretty ? `, ${pretty}` : ""}.</h1>
            <p className="mt-3 text-muted-foreground">
              Seriously — this keeps the servers alive. Every tip goes straight into MasterChess.
              <br />
              <span className="text-foreground/80">— Nikola, 13</span>
            </p>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/supporter">
                  <Crown className="mr-2 h-4 w-4" />
                  See the supporter wall
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/play">
                  Play a game <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        )}

        {status === "pending" && (
          <>
            <h1 className="text-2xl font-bold">Payment pending</h1>
            <p className="mt-3 text-muted-foreground">
              Stripe hasn't confirmed your payment yet. Give it a minute and refresh, or check your email for the receipt.
            </p>
            <Button asChild className="mt-6">
              <Link to="/supporter">Back to support page</Link>
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold">Couldn't verify the payment</h1>
            <p className="mt-3 text-muted-foreground">
              If money left your account, don't worry — it still counts. Email contact@masterchess.live and we'll sort it out.
            </p>
            <Button asChild className="mt-6">
              <Link to="/supporter">Back to support page</Link>
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}
