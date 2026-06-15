// Generates a 1200x630 PNG share card from a finished game.
// Pure canvas — no external deps.

export interface ShareCardData {
  resultText: string; // "WIN" | "LOSS" | "DRAW"
  subText?: string;   // e.g. "by checkmate · 32 moves"
  playerName?: string;
  opponentName?: string;
  eloDelta?: number;  // signed
  opening?: string;
}

const GOLD = "#D4AF37";
const GOLD_DIM = "#8a6f1f";
const BG_TOP = "#0b0d12";
const BG_BOTTOM = "#1a1410";

export async function generateShareCard(data: ShareCardData): Promise<Blob> {
  const W = 1200;
  const H = 630;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, BG_TOP);
  grad.addColorStop(1, BG_BOTTOM);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Diagonal gold accent
  ctx.save();
  ctx.translate(W - 280, 0);
  ctx.rotate(0.35);
  const stripe = ctx.createLinearGradient(0, 0, 200, 0);
  stripe.addColorStop(0, "rgba(212,175,55,0.0)");
  stripe.addColorStop(0.5, "rgba(212,175,55,0.18)");
  stripe.addColorStop(1, "rgba(212,175,55,0.0)");
  ctx.fillStyle = stripe;
  ctx.fillRect(0, -100, 200, H + 200);
  ctx.restore();

  // Top brand
  ctx.fillStyle = GOLD;
  ctx.font = "600 28px 'Inter', system-ui, sans-serif";
  ctx.fillText("MASTERCHESS.LIVE", 60, 70);

  // Hairline
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 95);
  ctx.lineTo(W - 60, 95);
  ctx.stroke();

  // Big result
  ctx.fillStyle = "#f5f1e6";
  ctx.font = "900 200px 'Inter', system-ui, sans-serif";
  ctx.fillText(data.resultText.toUpperCase(), 60, 290);

  // Underline accent
  ctx.fillStyle = GOLD;
  ctx.fillRect(60, 310, 180, 6);

  // Subtext
  if (data.subText) {
    ctx.fillStyle = "rgba(245,241,230,0.7)";
    ctx.font = "400 32px 'Inter', system-ui, sans-serif";
    ctx.fillText(data.subText, 60, 370);
  }

  // Players line
  let y = 440;
  if (data.playerName || data.opponentName) {
    ctx.fillStyle = "rgba(245,241,230,0.55)";
    ctx.font = "500 24px 'Inter', system-ui, sans-serif";
    ctx.fillText("MATCHUP", 60, y);
    y += 40;
    ctx.fillStyle = "#f5f1e6";
    ctx.font = "700 38px 'Inter', system-ui, sans-serif";
    const matchup = `${data.playerName ?? "You"}  vs  ${data.opponentName ?? "Opponent"}`;
    ctx.fillText(matchup, 60, y);
  }

  // Opening tag (bottom-left)
  if (data.opening) {
    ctx.fillStyle = "rgba(212,175,55,0.85)";
    ctx.font = "italic 500 26px 'Inter', system-ui, sans-serif";
    ctx.fillText(`${data.opening}`, 60, H - 50);
  }

  // ELO delta (top-right pill)
  if (typeof data.eloDelta === "number" && data.eloDelta !== 0) {
    const sign = data.eloDelta > 0 ? "+" : "";
    const text = `${sign}${data.eloDelta} ELO`;
    ctx.font = "800 40px 'Inter', system-ui, sans-serif";
    const pad = 28;
    const tw = ctx.measureText(text).width;
    const pillW = tw + pad * 2;
    const pillH = 70;
    const px = W - 60 - pillW;
    const py = 140;
    ctx.fillStyle = data.eloDelta > 0 ? "rgba(212,175,55,0.18)" : "rgba(255,80,80,0.18)";
    ctx.strokeStyle = data.eloDelta > 0 ? GOLD : "#ff5050";
    ctx.lineWidth = 2;
    const r = 16;
    ctx.beginPath();
    ctx.moveTo(px + r, py);
    ctx.arcTo(px + pillW, py, px + pillW, py + pillH, r);
    ctx.arcTo(px + pillW, py + pillH, px, py + pillH, r);
    ctx.arcTo(px, py + pillH, px, py, r);
    ctx.arcTo(px, py, px + pillW, py, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = data.eloDelta > 0 ? GOLD : "#ff8080";
    ctx.fillText(text, px + pad, py + 50);
  }

  // CTA bottom-right
  ctx.fillStyle = "rgba(245,241,230,0.55)";
  ctx.font = "500 24px 'Inter', system-ui, sans-serif";
  const cta = "play free → masterchess.live";
  const ctaW = ctx.measureText(cta).width;
  ctx.fillText(cta, W - 60 - ctaW, H - 50);

  return await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), "image/png", 0.95);
  });
}

export async function downloadShareCard(data: ShareCardData, filename = "masterchess-share.png") {
  const blob = await generateShareCard(data);
  const file = new File([blob], filename, { type: "image/png" });

  // Try Web Share API with files first
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "My MasterChess game",
        text: "Just played on masterchess.live",
      });
      return;
    } catch {
      // fall through to download
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
