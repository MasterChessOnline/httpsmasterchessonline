import { XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const PaymentCanceled = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center container mx-auto px-6 py-24">
        <div className="max-w-md w-full text-center space-y-6 p-8 border border-border/50 rounded-2xl bg-card/50 backdrop-blur-sm">
          <XCircle className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Payment Canceled</h1>
          <p className="text-muted-foreground">
            The payment process was canceled. No charges were made.
          </p>
          <div className="pt-6">
            <Link to="/">
              <Button>Return Home</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentCanceled;
