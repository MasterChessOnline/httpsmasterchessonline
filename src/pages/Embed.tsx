import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

// Public /embed page — teaches bloggers/streamers how to embed the promo widget.
export default function Embed() {
  const [copied, setCopied] = useState(false);
  const snippet = `<iframe src="https://masterchess.live/embed/play" width="360" height="440" frameborder="0" style="border:0;border-radius:12px;overflow:hidden" title="Play chess on MasterChess"></iframe>`;

  function copy() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast.success("Embed code copied");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Embed MasterChess on your site — free chess widget</title>
        <meta name="description" content="Add a live chess widget to your blog or website in seconds. Free, no signup, no ads." />
        <link rel="canonical" href="https://masterchess.live/embed" />
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Embed MasterChess on your site</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Free chess widget for bloggers, streamers, and chess-club websites. Paste one line of code.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <Card className="p-4 flex items-center justify-center bg-muted/20">
            <iframe
              src="/embed/play?v=preview"
              width={340}
              height={420}
              className="rounded-lg border-0"
              title="Preview"
            />
          </Card>
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">Copy the code</h2>
            <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto whitespace-pre-wrap">{snippet}</pre>
            <Button onClick={copy} className="w-full">
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied" : "Copy embed code"}
            </Button>
            <div className="text-sm text-muted-foreground space-y-2 pt-2">
              <p><strong>Custom position:</strong> add <code>?fen=...</code> to show any FEN.</p>
              <p><strong>Attribution:</strong> the widget links back to MasterChess with UTM tracking.</p>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-primary/5 border-primary/20">
          <h2 className="font-semibold text-lg mb-2">Why embed?</h2>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>Keep readers on your page longer</li>
            <li>Free forever — no ads, no signup for players</li>
            <li>Works on any HTML page, WordPress, Ghost, Substack, Notion</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
