import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Loader2 } from "lucide-react";
import { downloadShareCard, type ShareCardData } from "@/lib/shareCard";
import { toast } from "sonner";

export default function ShareCardButton({ data, className }: { data: ShareCardData; className?: string }) {
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    setBusy(true);
    try {
      await downloadShareCard(data);
      toast.success("Share card ready");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't generate share card");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button onClick={onClick} disabled={busy} variant="outline" className={className}>
      {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Share2 className="h-4 w-4 mr-2" />}
      Share as image
    </Button>
  );
}
