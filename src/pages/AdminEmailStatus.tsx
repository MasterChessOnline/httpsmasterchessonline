import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

type RecordCheck = {
  type: string;
  name: string;
  expected: string[];
  found: string[];
  ok: boolean;
  note?: string;
};

type StatusResponse = {
  domain: string;
  checked_at: string;
  overall: "verified" | "partial" | "pending" | "failed";
  checks: RecordCheck[];
  troubleshooting: string[];
};

const POLL_MS = 30_000;

const overallMeta = {
  verified: {
    label: "Verified",
    desc: "All DNS records are in place. Branded emails will send from your domain.",
    icon: CheckCircle2,
    tone: "text-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
  },
  partial: {
    label: "Mostly verified",
    desc: "Required records are live; auxiliary records are still propagating.",
    icon: CheckCircle2,
    tone: "text-amber-400",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/40",
  },
  pending: {
    label: "Pending DNS",
    desc: "NS delegation detected. Waiting for SPF / DKIM / DMARC to propagate (can take a few hours).",
    icon: Loader2,
    tone: "text-amber-400",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/40",
  },
  failed: {
    label: "Not configured",
    desc: "DNS records are missing. Add NS records at your domain registrar to start verification.",
    icon: XCircle,
    tone: "text-destructive",
    badge: "bg-destructive/15 text-destructive border-destructive/40",
  },
} as const;

export default function AdminEmailStatus() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth + admin gate
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    (async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (error) {
        setIsAdmin(false);
        return;
      }
      setIsAdmin(Boolean(data));
    })();
  }, [user, authLoading, navigate]);

  const runCheck = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("check-email-domain");
      if (error) throw error;
      setStatus(data as StatusResponse);
    } catch (e: any) {
      const msg = e?.message ?? "Failed to check domain status";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial + polling
  useEffect(() => {
    if (!isAdmin) return;
    runCheck();
    const id = setInterval(runCheck, POLL_MS);
    return () => clearInterval(id);
  }, [isAdmin, runCheck]);

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-4xl px-4 pt-28 pb-16 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-2xl px-4 pt-28 pb-16">
          <Alert variant="destructive">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle>Admin access required</AlertTitle>
            <AlertDescription>
              This page contains operational data and is restricted to MasterChess admins.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const meta = status ? overallMeta[status.overall] : null;
  const Icon = meta?.icon ?? Loader2;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-4xl px-4 pt-28 pb-16 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-display tracking-wide flex items-center gap-3">
              <Mail className="h-7 w-7 text-primary" />
              Email Domain Status
            </h1>
            <p className="text-muted-foreground mt-1">
              Live DNS health check for{" "}
              <code className="text-primary">{status?.domain ?? "notify.masterchess.com"}</code>
            </p>
          </div>
          <Button onClick={runCheck} disabled={loading} variant="outline">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Recheck Now
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Check failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Overall status card */}
        <Card className="border-border/50 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-lg">Overall</CardTitle>
              {meta && (
                <Badge variant="outline" className={meta.badge}>
                  {meta.label}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {status && meta ? (
              <div className="flex items-start gap-4">
                <Icon
                  className={`h-10 w-10 shrink-0 ${meta.tone} ${
                    status.overall === "pending" ? "animate-spin" : ""
                  }`}
                />
                <div className="space-y-1">
                  <p className="text-foreground">{meta.desc}</p>
                  <p className="text-xs text-muted-foreground">
                    Last checked {new Date(status.checked_at).toLocaleString()} · Auto-refreshes every 30s
                  </p>
                </div>
              </div>
            ) : (
              <Skeleton className="h-16 w-full" />
            )}
          </CardContent>
        </Card>

        {/* Per-record breakdown */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">DNS Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {status?.checks.map((c) => (
              <div
                key={c.type}
                className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {c.ok ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <span className="font-mono text-sm font-semibold">{c.type}</span>
                    <code className="text-xs text-muted-foreground">{c.name}</code>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      c.ok
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                        : "bg-destructive/15 text-destructive border-destructive/40"
                    }
                  >
                    {c.ok ? "OK" : "Missing"}
                  </Badge>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground mb-1">Expected</div>
                    <div className="font-mono space-y-0.5">
                      {c.expected.map((e, i) => (
                        <div key={i} className="text-foreground/70 break-all">
                          {e}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Found</div>
                    <div className="font-mono space-y-0.5">
                      {c.found.length === 0 ? (
                        <span className="text-destructive/70">— none —</span>
                      ) : (
                        c.found.map((f, i) => (
                          <div key={i} className="text-foreground/90 break-all">
                            {f}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {c.note && (
                  <p className="text-xs text-muted-foreground border-t border-border/40 pt-2">
                    {c.note}
                  </p>
                )}
              </div>
            ))}
            {!status && (
              <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </>
            )}
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        {status && status.troubleshooting.length > 0 && (
          <Alert>
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Next steps</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                {status.troubleshooting.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
