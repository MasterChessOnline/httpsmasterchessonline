import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Mail } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <Mail className="h-12 w-12 text-primary mx-auto" />
          <h1 className="font-display text-2xl font-bold text-foreground">Check your email</h1>
          <p className="text-muted-foreground text-sm">
            If an account exists for <strong className="text-foreground">{email}</strong>, we sent a password reset link.
          </p>
          <Link to="/login">
            <Button variant="outline" className="mt-4">Back to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Crown className="h-8 w-8 text-primary" aria-hidden="true" />
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground">Reset password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2" role="alert">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send Reset Link"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-primary font-medium hover:underline">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
