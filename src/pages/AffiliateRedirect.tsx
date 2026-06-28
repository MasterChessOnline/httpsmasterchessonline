// /r/:code — affiliate landing. Logs a click and forwards the visitor.
// Used by partner creators (e.g. the IT influencer Nikola is meeting) so we
// can attribute signups and tournament joins back to their share link.
import { useEffect } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AffiliateRedirect() {
  const { code } = useParams<{ code: string }>();
  const [params] = useSearchParams();
  const to = params.get("to") || "/dragan-brakus";

  useEffect(() => {
    if (!code) return;
    try {
      sessionStorage.setItem("affiliate_code", code);
    } catch {}
    void (supabase.rpc as any)("log_affiliate_click", {
      _code: code,
      _referrer: document.referrer || null,
      _ua: navigator.userAgent || null,
    }).then(() => {}, () => {});

  }, [code]);

  return <Navigate to={to} replace />;
}
