import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Crown, Flame, Star } from "lucide-react";

interface DonationAlertData {
  id: string;
  username: string;
  amount: number;
  message?: string;
  type: "donation" | "subscription";
  tier?: string;
}

interface DonationAlertProps {
  alerts: DonationAlertData[];
  onAlertShown: (id: string) => void;
  soundEnabled: boolean;
  ttsEnabled: boolean;
}

const DONATION_SOUND_URL = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==";

export default function DonationAlert({ alerts, onAlertShown, soundEnabled, ttsEnabled }: DonationAlertProps) {
  const [currentAlert, setCurrentAlert] = useState<DonationAlertData | null>(null);

  const playSound = useCallback((amount: number) => {
    if (!soundEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = amount >= 2000 ? 880 : amount >= 1000 ? 660 : 440;
      osc.type = amount >= 2000 ? "triangle" : "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch {}
  }, [soundEnabled]);

  const speakMessage = useCallback((username: string, amount: number, message?: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    const amountDollars = (amount / 100).toFixed(0);
    let text = `${username} donated ${amountDollars} dollars.`;
    if (message && message.length <= 120) {
      text += ` They say: ${message}`;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  useEffect(() => {
    if (currentAlert || alerts.length === 0) return;
    const next = alerts[0];
    setCurrentAlert(next);
    playSound(next.amount);
    if (next.type === "donation" && next.amount >= 200) {
      speakMessage(next.username, next.amount, next.message);
    }
    onAlertShown(next.id);
    const timer = setTimeout(() => setCurrentAlert(null), 5000);
    return () => clearTimeout(timer);
  }, [alerts, currentAlert, playSound, speakMessage, onAlertShown]);

  const isBig = currentAlert && currentAlert.amount >= 2000;
  const tierIcon = currentAlert?.tier === "legend" ? Crown :
    currentAlert?.tier === "vip" ? Flame : Star;
  const TierIcon = tierIcon;

  return (
    <AnimatePresence>
      {currentAlert && (
        <motion.div
          key={currentAlert.id}
          initial={{ opacity: 0, scale: 0.5, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -30 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          <div className={`relative px-8 py-5 rounded-2xl border backdrop-blur-xl text-center min-w-[300px] max-w-[500px] ${
            currentAlert.type === "subscription"
              ? "bg-gradient-to-br from-purple-900/90 to-indigo-900/90 border-purple-400/50"
              : isBig
                ? "bg-gradient-to-br from-yellow-900/90 to-amber-900/90 border-yellow-400/60"
                : "bg-gradient-to-br from-primary/20 to-accent/10 border-primary/40"
          }`}>
            {/* Glow effect */}
            <div className={`absolute inset-0 rounded-2xl blur-xl opacity-40 ${
              currentAlert.type === "subscription" ? "bg-purple-500" :
              isBig ? "bg-yellow-500" : "bg-primary"
            }`} />
            
            <div className="relative z-10">
              {currentAlert.type === "subscription" ? (
                <>
                  <TierIcon className="w-10 h-10 mx-auto mb-2 text-purple-300 animate-bounce" />
                  <p className="text-lg font-bold text-purple-200">New Subscriber!</p>
                  <p className="text-2xl font-display font-bold text-white mt-1">{currentAlert.username}</p>
                  <p className="text-sm text-purple-300 mt-1 capitalize">{currentAlert.tier} Tier</p>
                </>
              ) : (
                <>
                  <DollarSign className={`w-10 h-10 mx-auto mb-2 ${isBig ? "text-yellow-300 animate-bounce" : "text-primary"}`} />
                  <p className="text-sm font-semibold text-muted-foreground">
                    {currentAlert.username} donated
                  </p>
                  <p className={`text-3xl font-display font-bold mt-1 ${isBig ? "text-yellow-300" : "text-primary"}`}>
                    ${(currentAlert.amount / 100).toFixed(2)}
                  </p>
                  {currentAlert.message && (
                    <p className="text-sm text-foreground/80 mt-2 italic max-w-xs mx-auto">
                      "{currentAlert.message}"
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type { DonationAlertData };
