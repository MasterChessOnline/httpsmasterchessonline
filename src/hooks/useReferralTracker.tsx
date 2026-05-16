import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const REF_KEY = "mc_ref_code";
const FP_KEY = "mc_visitor_fp";
const CLAIMED_KEY = "mc_ref_claimed";

function getOrCreateFingerprint(): string {
  try {
    let fp = localStorage.getItem(FP_KEY);
    if (!fp) {
      fp = (crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36));
      localStorage.setItem(FP_KEY, fp);
    }
    return fp;
  } catch {
    return "anon";
  }
}

/**
 * Global referral tracker:
 *   1. ?ref=XXXXXXXX in any URL → save to localStorage + log a visit row.
 *   2. When a user signs in for the first time with a stored ref, attribute the conversion.
 */
export default function ReferralTracker() {
  const location = useLocation();
  const { user } = useAuth();

  // Capture ?ref= and log a visit
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const ref = params.get("ref");
      if (!ref || ref.length < 4 || ref.length > 32) return;
      const code = ref.toLowerCase();
      const prev = localStorage.getItem(REF_KEY);
      localStorage.setItem(REF_KEY, code);
      const fp = getOrCreateFingerprint();
      // Only log a visit once per (ref, browser) — backend also dedupes.
      const visitedKey = `mc_ref_visited:${code}`;
      if (!localStorage.getItem(visitedKey) || prev !== code) {
        (supabase.rpc as any)("track_referral_visit", {
          p_ref_code: code,
          p_fingerprint: fp,
          p_user_agent: navigator.userAgent.slice(0, 200),
        }).then(() => {
          localStorage.setItem(visitedKey, "1");
        });
      }
    } catch { /* noop */ }
  }, [location.search]);

  // After signup/login, attribute conversion exactly once
  useEffect(() => {
    if (!user) return;
    try {
      const code = localStorage.getItem(REF_KEY);
      if (!code) return;
      if (localStorage.getItem(CLAIMED_KEY) === user.id) return;
      // Don't credit self-invites
      if (user.id.slice(0, 8).toLowerCase() === code) {
        localStorage.removeItem(REF_KEY);
        return;
      }
      (supabase.rpc as any)("claim_referral_signup", { p_ref_code: code }).then(() => {
        localStorage.setItem(CLAIMED_KEY, user.id);
      });
    } catch { /* noop */ }
  }, [user?.id]);

  return null;
}
