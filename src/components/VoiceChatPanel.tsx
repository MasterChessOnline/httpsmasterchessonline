import { useState } from "react";
import { Mic, MicOff, PhoneOff, Phone, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useVoiceChat } from "@/hooks/use-voice-chat";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  roomId: string | null;
  userId: string | null;
  /** Optional compact label for the call-to-action button when idle. */
  ctaLabel?: string;
}

/**
 * Drop-in P2P voice chat panel for 2-player rooms (e.g. online games).
 * Renders a small call-control bar. Voice is opt-in per game.
 */
export default function VoiceChatPanel({ roomId, userId, ctaLabel = "Voice chat" }: Props) {
  const { active, connected, micOn, start, stop, toggleMic, remoteAudioRef } = useVoiceChat(roomId, userId);
  const [busy, setBusy] = useState(false);

  if (!roomId || !userId) return null;

  async function handleStart() {
    if (busy) return;
    setBusy(true);
    try {
      await start();
      toast({ title: "Voice chat on", description: "You're now mic'd up with your opponent." });
    } catch {
      toast({ title: "Mic blocked", description: "Allow microphone access in your browser to use voice chat.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  function handleStop() {
    stop();
    toast({ title: "Voice chat ended" });
  }

  return (
    <div className="inline-flex items-center gap-2">
      {/* Hidden remote audio sink */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      <AnimatePresence mode="wait" initial={false}>
        {!active ? (
          <motion.div key="idle" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
            <Button size="sm" variant="secondary" onClick={handleStart} disabled={busy} className="gap-1.5">
              <Phone className="h-4 w-4" />
              <span className="text-xs font-semibold">{ctaLabel}</span>
            </Button>
          </motion.div>
        ) : (
          <motion.div key="live" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 pl-2 pr-1 py-1"
          >
            <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
              {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3 animate-pulse" />}
              <span>{connected ? "LIVE" : "..."}</span>
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={toggleMic} title={micOn ? "Mute" : "Unmute"}>
              {micOn ? <Mic className="h-4 w-4 text-emerald-400" /> : <MicOff className="h-4 w-4 text-red-400" />}
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full hover:bg-red-500/20" onClick={handleStop} title="End call">
              <PhoneOff className="h-4 w-4 text-red-400" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
