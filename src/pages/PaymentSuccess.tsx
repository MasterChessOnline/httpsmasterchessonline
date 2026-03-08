import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    const verifyPayment = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { sessionId },
        });

        if (error) throw error;
        if (data?.success) {
          setStatus("success");
          setMetadata(data.metadata);
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center container mx-auto px-6 py-24">
        <div className="max-w-md w-full text-center space-y-6 p-8 border border-border/50 rounded-2xl bg-card/50 backdrop-blur-sm">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
              <h1 className="text-2xl font-bold">Verifying payment...</h1>
              <p className="text-muted-foreground">Please wait a moment while we confirm your transaction.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h1 className="text-2xl font-bold">Payment Successful!</h1>
              <p className="text-muted-foreground">
                {metadata?.itemType === "donation" 
                  ? "Thank you so much for your generous support! It means the world to us."
                  : "Your purchase has been confirmed. You can now access your content."}
              </p>
              <div className="pt-6 flex justify-center gap-4">
                <Link to="/">
                  <Button variant="outline">Back to Home</Button>
                </Link>
                {metadata?.itemType === "course" && (
                  <Link to={`/learn/course/${metadata.itemId}`}>
                    <Button>Go to Course <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </Link>
                )}
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto text-destructive text-2xl font-bold">!</div>
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="text-muted-foreground">
                We couldn't verify your payment. If you were charged, please contact support.
              </p>
              <div className="pt-6">
                <Link to="/">
                  <Button>Return Home</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;
