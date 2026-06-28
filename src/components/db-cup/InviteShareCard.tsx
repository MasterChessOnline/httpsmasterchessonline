// Personal invite share card — shown after a user registers for the
// Dragan Brakus Cup. Generates / fetches a personal invite code,
// renders share buttons (WhatsApp / Telegram / X / Facebook / copy)
// and a QR code linking to /i/:code so the user can post to socials.
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Copy, QrCode, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const SITE = "https://masterchess.live";
const REWARD_COINS = 50;

function makeCode(userId: string) {
  // 6-char code derived from uid + random salt — readable + unique enough.
  const base = userId.replace(/-/g, "").slice(0, 4);
  const salt = Math.random().toString(36).slice(2, 4);
  return `${base}${salt}`.toUpperCase();
}

export default function InviteShareCard({
  userId,
  tournamentId,
}: { userId: string; tournamentId: string }) {
  const [code, setCode] = useState<string | null>(null);
  const [uses, setUses] = useState<number>(0);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Fetch existing invite for this user+tournament
      const { data } = await supabase
        .from("tournament_invites")
        .select("code, uses")
        .eq("created_by", userId)
        .eq("tournament_id", tournamentId)
        .maybeSingle();
      if (cancelled) return;
      if (data?.code) {
        setCode(data.code);
        setUses(data.uses || 0);
        return;
      }
      // Otherwise create one
      const newCode = makeCode(userId);
      const { data: ins, error } = await supabase
        .from("tournament_invites")
        .insert({
          code: newCode,
          tournament_id: tournamentId,
          created_by: userId,
          reward_coins: REWARD_COINS,
          max_uses: 100,
        })
        .select("code, uses")
        .single();
      if (cancelled) return;
      if (!error && ins) {
        setCode(ins.code);
        setUses(ins.uses || 0);
      }
    })();
    return () => { cancelled = true; };
  }, [userId, tournamentId]);

  const url = useMemo(() => code ? `${SITE}/i/${code}` : `${SITE}/dragan-brakus`, [code]);
  const shareText = encodeURIComponent(
    `Join me at the Dragan Brakus Cup — 9-round Swiss Blitz on MasterChess. Free entry, MasterChess loot prizes. ${url}`
  );
  // Public, no-tracking QR generator
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: "Your personal invite is on the clipboard." });
    } catch {
      toast({ title: "Copy failed", description: url, variant: "destructive" });
    }
  };

  return (
    <Card className="mt-4 p-5 border-yellow-500/30 max-w-2xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs uppercase text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3 text-yellow-400" /> Your personal invite
          </div>
          <div className="font-mono text-yellow-300 text-lg mt-1">{url}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Earn <span className="text-yellow-300 inline-flex items-center gap-0.5"><Coins className="h-3 w-3" /> {REWARD_COINS} coins</span> per friend who registers. Used <strong>{uses}</strong>×.
          </div>
        </div>
        <Badge variant="outline" className="border-yellow-500/40 text-yellow-300">
          {uses >= 3 ? "Captain ✓" : `${3 - uses} to Captain badge`}
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={copy}>
          <Copy className="h-3.5 w-3.5 mr-1" /> Copy link
        </Button>
        <a className="rounded-md bg-green-600 text-white text-xs px-2.5 py-1.5 inline-flex items-center" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${shareText}`}>WhatsApp</a>
        <a className="rounded-md bg-sky-500 text-white text-xs px-2.5 py-1.5 inline-flex items-center" target="_blank" rel="noreferrer" href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${shareText}`}>Telegram</a>
        <a className="rounded-md bg-black text-white text-xs px-2.5 py-1.5 inline-flex items-center border border-white/20" target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?text=${shareText}`}>X</a>
        <a className="rounded-md bg-blue-700 text-white text-xs px-2.5 py-1.5 inline-flex items-center" target="_blank" rel="noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}>Facebook</a>
        <Button size="sm" variant="outline" onClick={() => setShowQr(v => !v)}>
          <QrCode className="h-3.5 w-3.5 mr-1" /> {showQr ? "Hide" : "QR"}
        </Button>
      </div>

      {showQr && code && (
        <div className="mt-4 flex items-center gap-4">
          <img src={qrSrc} alt="Invite QR code" width={180} height={180} className="rounded-lg bg-white p-2" />
          <p className="text-xs text-muted-foreground max-w-xs">
            Print this QR on flyers, stick it in your club, or post it to your story. Anyone who scans lands on the cup with your invite credited.
          </p>
        </div>
      )}
    </Card>
  );
}
