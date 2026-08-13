import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MailCheck, Loader2, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

type Status = "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [status, setStatus] = useState<Status>("verifying");
  const [errorMsg, setErrorMsg] = useState("");
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const verify = async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash");
      const type = params.get("type");

      if (!tokenHash || !type) {
        // No token in URL (e.g. user landed directly) — check session and mark verified if logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("profiles").update({ email_verified: true }).eq("id", user.id);
          await refreshProfile();
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMsg("No verification token found in the link. Please request a new one.");
        }
        return;
      }

      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as "magiclink" });
      if (error) {
        setStatus("error");
        setErrorMsg(error.message || "This verification link is invalid or has expired. Please request a new one.");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ email_verified: true }).eq("id", user.id);
        await refreshProfile();
      }
      setStatus("success");
    };

    verify();
  }, [refreshProfile]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card overflow-hidden text-center">
          {status === "verifying" && (
            <div className="px-8 py-14 flex flex-col items-center gap-5">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <h1 className="text-xl font-bold text-foreground">Verifying your email…</h1>
              <p className="text-sm text-muted-foreground">Please wait a moment while we confirm your address.</p>
            </div>
          )}

          {status === "success" && (
            <div className="px-8 py-14 flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <MailCheck className="w-8 h-8 text-emerald-500" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Email verified!</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your email address has been confirmed. You now have full access to ConnectAngel, including the Potential page.
              </p>
              <button
                onClick={() => navigate("/potential")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-[hsl(240,70%,60%)] text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Go to Potential
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Back to Home
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="px-8 py-14 flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Verification failed</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">{errorMsg}</p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-[hsl(240,70%,60%)] text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
