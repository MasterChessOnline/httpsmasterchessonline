// Applies <body data-milestone="50"> based on donation progress.
// Lets index.css gate site-wide celebratory cosmetics by milestone tier.
import { useEffect } from "react";
import { useDonationProgress } from "@/hooks/use-donation-progress";

export default function DonationMilestoneBodyAttr() {
  const { milestone, loading } = useDonationProgress();
  useEffect(() => {
    if (loading) return;
    document.body.dataset.milestone = String(milestone);
    return () => {
      delete document.body.dataset.milestone;
    };
  }, [milestone, loading]);
  return null;
}
