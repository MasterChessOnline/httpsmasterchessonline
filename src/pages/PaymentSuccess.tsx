import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [verified, setVerified] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    supabase.functions
      .invoke("verify-payment", { body: { sessionId } })
      .then(({ data }) => {
        if (data?.success) {
          setVerified(true);
          if (data.amount) setAmount(data.amount);
        }
      });
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background grain-texture">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20 max-w-lg text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="glass-elevated rounded-2xl p-8 md:p-12 space-y-6"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>

          <h1 className="text-3xl font-bold text-foreground">Thank You!</h1>

          <p className="text-muted-foreground text-lg">
            Your generous donation
            {amount ? ` of $${(amount / 100).toFixed(2)}` : ""} helps keep
            MasterChess free for everyone.
          </p>

          <Heart className="w-8 h-8 text-primary mx-auto animate-pulse" />

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
              </Link>
            </Button>
            <Button asChild>
              <Link to="/play">Play Chess</Link>
            </Button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
