import { useEffect, useState } from "react";
import MatchResultModal, { type MatchResultData } from "@/components/MatchResultModal";

interface Payload extends MatchResultData {
  onRematch?: () => void;
  onReview?: () => void;
}

/** Mounts once in <App />. Listens for `mc:match-result` and shows the modal. */
export default function MatchResultLayer() {
  const [data, setData] = useState<Payload | null>(null);

  useEffect(() => {
    const onEvt = (e: Event) => {
      const detail = (e as CustomEvent).detail as Payload | undefined;
      if (detail) setData(detail);
    };
    window.addEventListener("mc:match-result", onEvt);
    return () => window.removeEventListener("mc:match-result", onEvt);
  }, []);

  return (
    <MatchResultModal
      open={!!data}
      data={data}
      onClose={() => setData(null)}
      onRematch={data?.onRematch ? () => { data.onRematch?.(); setData(null); } : undefined}
      onReview={data?.onReview ? () => { data.onReview?.(); setData(null); } : undefined}
    />
  );
}
