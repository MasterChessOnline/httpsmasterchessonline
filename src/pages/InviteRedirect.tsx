// /i/:code — stores the invite code in sessionStorage and forwards
// the visitor to the Dragan Brakus Cup landing page. The page reads
// the code on register and credits the inviter (+50 Master Coins).
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function InviteRedirect() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      try { sessionStorage.setItem("db_cup_invite_code", code); } catch {}
    }
    navigate(`/dragan-brakus?invite=${encodeURIComponent(code || "")}`, { replace: true });
  }, [code, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      Redirecting to the Dragan Brakus Cup…
    </div>
  );
}
