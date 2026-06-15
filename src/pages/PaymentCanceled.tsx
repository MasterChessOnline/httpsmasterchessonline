import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCanceled() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <Helmet>
        <title>Payment canceled — MasterChess</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-8 text-center"
      >
        <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Payment canceled</h1>
        <p className="mt-3 text-muted-foreground">
          No charge was made. If something went wrong, try again — even $1 helps keep the lights on.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/supporter">Back to support</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Home</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
