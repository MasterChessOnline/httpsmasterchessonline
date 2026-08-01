// Email capture block. Stores the address in contact_messages (anon insert
// is allowed there), so no new table is needed.
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Check, Loader2 } from "lucide-react";

interface Props {
  heading?: string;
  subheading?: string;
  source?: string;
}

export default function EmailCaptureSection({
  heading = "Get the daily chess drop",
  subheading = "One email a day: a puzzle, a brilliant move and who is winning on MasterChess.",
  source = "email-capture",
}: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) || value.length > 255) {
      setError("Please enter a valid email address.");
      setState("error");
      return;
    }
    setState("sending");
    setError("");
    const { error: insertError } = await supabase.from("contact_messages").insert({
      name: "Newsletter subscriber",
      email: value,
      message: `Email capture signup (${source})`,
    });
    if (insertError) {
      setError("Could not subscribe right now. Please try again in a minute.");
      setState("error");
      return;
    }
    setState("done");
    setEmail("");
  };

  return (
    <section className="px-4 py-12" aria-labelledby="email-capture-heading">
      <div className="max-w-2xl mx-auto rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-6 sm:p-8 text-center">
        <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary/15 mb-3">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <h2 id="email-capture-heading" className="font-display text-2xl font-bold text-foreground">
          {heading}
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{subheading}</p>

        {state === "done" ? (
          <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <Check className="h-4 w-4" /> You're on the list. Check your inbox tomorrow.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-5 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <label htmlFor="email-capture-input" className="sr-only">
              Email address
            </label>
            <Input
              id="email-capture-input"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={255}
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={state === "sending"}>
              {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
            </Button>
          </form>
        )}
        {state === "error" && <p className="mt-3 text-xs text-destructive">{error}</p>}
        <p className="mt-3 text-[11px] text-muted-foreground">No spam. Unsubscribe any time.</p>
      </div>
    </section>
  );
}
