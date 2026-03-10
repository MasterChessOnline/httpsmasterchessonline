import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { hasAccess, type TierKey } from "@/lib/premium-tiers";
import { Loader2 } from "lucide-react";

interface PremiumGuardProps {
  children: ReactNode;
  requiredTier?: TierKey;
}

const PremiumGuard = ({ children, requiredTier = "premium" }: PremiumGuardProps) => {
  const { user, loading, isPremium, subscriptionTier } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isPremium || !hasAccess(subscriptionTier, requiredTier)) {
    return <Navigate to="/premium" replace />;
  }

  return <>{children}</>;
};

export default PremiumGuard;
