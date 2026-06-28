// Pairing bridge UI for DB Chess Cup.
// MasterChess generates FIDE-compliant TRF(x) pairings natively, then mirrors
// them to ChessHost.app so external arbiters / federations can verify.
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Network } from "lucide-react";

const PROJECT = "kicabdwgdyabibioycbq";

export default function ChessHostBridge({ tournamentId }: { tournamentId: string }) {
  const trfUrl = `https://${PROJECT}.supabase.co/functions/v1/tournament-export?tournament_id=${tournamentId}&format=trf`;
  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6 mb-10">
      <div className="flex items-start gap-3 flex-wrap">
        <div className="rounded-md bg-cyan-500/15 p-2 text-cyan-300">
          <Network className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-[240px]">
          <h2 className="text-xl font-bold">ChessHost.app pairing bridge</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Pairings are generated on MasterChess using the FIDE Dutch Swiss
            algorithm and mirrored to{" "}
            <a className="underline text-cyan-300" href="https://chesshost.app" target="_blank" rel="noreferrer">
              ChessHost.app
            </a>{" "}
            in standard TRF(x) format. Arbiters and external federations can
            verify every round with one click.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Button asChild className="bg-cyan-500 text-black hover:bg-cyan-400">
          <a href={trfUrl} target="_blank" rel="noreferrer">
            Download TRF for ChessHost
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href="https://chesshost.app" target="_blank" rel="noreferrer">
            Open ChessHost.app <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </a>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Workflow: download TRF → import on ChessHost → publish round → paste
        results back here after each round. Full standings stay authoritative on
        MasterChess.
      </p>
    </section>
  );
}
