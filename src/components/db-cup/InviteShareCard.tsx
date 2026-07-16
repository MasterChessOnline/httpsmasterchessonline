// Personal invite share card — Viber + Web Share API + IG Story PNG generator.
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Copy, QrCode, Users, Share2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const SITE = "https://masterchess.live";
const REWARD_COINS = 50;

function makeCode(userId: string) {
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("tournament_invites")
        .select("code, uses")
        .eq("created_by", userId)
        .eq("tournament_id", tournamentId)
        .maybeSingle();
      if (cancelled) return;
      if (data?.code) { setCode(data.code); setUses(data.uses || 0); return; }
      const newCode = makeCode(userId);
      const { data: ins, error } = await supabase
        .from("tournament_invites")
        .insert({ code: newCode, tournament_id: tournamentId, created_by: userId, reward_coins: REWARD_COINS, max_uses: 100 })
        .select("code, uses").single();
      if (cancelled) return;
      if (!error && ins) { setCode(ins.code); setUses(ins.uses || 0); }
    })();
    return () => { cancelled = true; };
  }, [userId, tournamentId]);

  const url = useMemo(() => code ? `${SITE}/i/${code}` : `${SITE}/dragan-brakus`, [code]);
  const shareText = `Join me at the Dragan Brakus Cup — 9-round Swiss Blitz on MasterChess. Free entry, MasterChess loot + grand prize revealed live. ${url}`;
  const encoded = encodeURIComponent(shareText);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;
  const qrBig = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${encodeURIComponent(url)}&margin=2&bgcolor=ffffff`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); toast({ title: "Link copied", description: "Your personal invite is on the clipboard." }); }
    catch { toast({ title: "Copy failed", description: url, variant: "destructive" }); }
  };

  const copyIgBio = async () => {
    const bio = `${SITE}/i/${code || ""}?utm_source=ig&utm_medium=bio`;
    try { await navigator.clipboard.writeText(bio); toast({ title: "IG bio link copied", description: "Paste it into your Instagram bio." }); }
    catch { toast({ title: "Copy failed", description: bio, variant: "destructive" }); }
  };

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try { await (navigator as any).share({ title: "Dragan Brakus Cup", text: shareText, url }); }
      catch { /* user cancelled */ }
    } else { copy(); }
  };

  // 1080×1920 Instagram Story PNG with QR + invite code.
  const downloadStoryPng = async () => {
    if (!code) return;
    const c = canvasRef.current || document.createElement("canvas");
    c.width = 1080; c.height = 1920;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const g = ctx.createLinearGradient(0, 0, 1080, 1920);
    g.addColorStop(0, "#0b0a14"); g.addColorStop(0.5, "#0f1830"); g.addColorStop(1, "#1a1208");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    const blob = (x: number, y: number, r: number, color: string) => {
      const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, color); rg.addColorStop(1, "transparent");
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    };
    blob(180, 220, 500, "rgba(217,170,40,0.45)");
    blob(900, 480, 520, "rgba(56,120,255,0.40)");
    blob(540, 1700, 540, "rgba(40,200,140,0.30)");
    ctx.textAlign = "center"; ctx.fillStyle = "#f7e9b8";
    ctx.font = "bold 86px Georgia, serif";
    ctx.fillText("DRAGAN BRAKUS CUP", 540, 320);
    ctx.font = "italic 44px Georgia, serif"; ctx.fillStyle = "#cfd6e4";
    ctx.fillText("9-round Swiss Blitz · 23 July 2026", 540, 400);
    ctx.fillText("16:00 CEST · masterchess.live", 540, 460);
    ctx.fillStyle = "rgba(255,210,80,0.18)"; ctx.fillRect(140, 560, 800, 130);
    ctx.strokeStyle = "rgba(255,210,80,0.7)"; ctx.lineWidth = 3;
    ctx.strokeRect(140, 560, 800, 130);
    ctx.fillStyle = "#ffd24a"; ctx.font = "bold 36px Inter, sans-serif";
    ctx.fillText("YOUR INVITE CODE", 540, 615);
    ctx.fillStyle = "#fff"; ctx.font = "bold 72px ui-monospace, monospace";
    ctx.fillText(code, 540, 685);
    try {
      const img = new Image(); img.crossOrigin = "anonymous"; img.src = qrBig;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
      ctx.fillStyle = "#fff"; ctx.fillRect(330, 800, 420, 420);
      ctx.drawImage(img, 330, 800, 420, 420);
    } catch { /* QR failed — continue */ }
    ctx.fillStyle = "#ffd24a"; ctx.font = "bold 56px Inter, sans-serif";
    ctx.fillText("SCAN · REGISTER · PLAY", 540, 1340);
    ctx.fillStyle = "#cfd6e4"; ctx.font = "36px Inter, sans-serif";
    ctx.fillText("Prizes · Coins · Lesson with Nikola · Trophy", 540, 1410);
    ctx.fillText(`masterchess.live/i/${code}`, 540, 1470);
    ctx.fillStyle = "#7a7158"; ctx.font = "italic 30px Georgia, serif";
    ctx.fillText("MasterChess.live · founded by Nikola Sakotić", 540, 1820);

    c.toBlob((b) => {
      if (!b) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(b);
      link.download = `db-cup-invite-${code}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 5000);
      toast({ title: "Story image downloaded", description: "Open Instagram → Story → Upload from gallery." });
    }, "image/png");
  };

  return (
    <Card className="mt-4 p-5 border-yellow-500/30 max-w-2xl">
      <canvas ref={canvasRef} className="hidden" />
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
        <Button size="sm" variant="secondary" onClick={nativeShare} title="Open OS share sheet (Viber, Messages, anything)">
          <Share2 className="h-3.5 w-3.5 mr-1" /> Share
        </Button>
        <Button size="sm" variant="secondary" onClick={copy}>
          <Copy className="h-3.5 w-3.5 mr-1" /> Copy link
        </Button>
        <a className="rounded-md bg-green-600 text-white text-xs px-2.5 py-1.5 inline-flex items-center" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encoded}`}>WhatsApp</a>
        <a className="rounded-md bg-purple-600 text-white text-xs px-2.5 py-1.5 inline-flex items-center" target="_blank" rel="noreferrer" href={`viber://forward?text=${encoded}`}>Viber</a>
        <a className="rounded-md bg-sky-500 text-white text-xs px-2.5 py-1.5 inline-flex items-center" target="_blank" rel="noreferrer" href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encoded}`}>Telegram</a>
        <a className="rounded-md bg-black text-white text-xs px-2.5 py-1.5 inline-flex items-center border border-white/20" target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?text=${encoded}`}>X</a>
        <a className="rounded-md bg-blue-700 text-white text-xs px-2.5 py-1.5 inline-flex items-center" target="_blank" rel="noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}>Facebook</a>
        <Button size="sm" variant="outline" onClick={downloadStoryPng} disabled={!code} className="border-pink-400/60 text-pink-300">
          <ImageIcon className="h-3.5 w-3.5 mr-1" /> IG Story PNG
        </Button>
        <Button size="sm" variant="outline" onClick={copyIgBio} disabled={!code} className="border-pink-400/40">
          Copy IG bio link
        </Button>
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
