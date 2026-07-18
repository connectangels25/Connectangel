import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ExpiredPlanOverlay() {
  const navigate = useNavigate();
  const { isFreeTrialExpired } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!isFreeTrialExpired || dismissed) return null;

  const handleDismiss = () => setDismissed(true);

  const handleUpgrade = () => {
    navigate("/pricing");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-background to-background" />

      <div className="relative z-10 w-full max-w-md mx-auto px-6 text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center mb-8 border border-amber-500/20">
          <Crown className="w-10 h-10 text-amber-500" />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-3">
          Your Plan Has Expired
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Your 26-day free trial has ended. Upgrade to Pro to unlock unlimited access to potential matching, advanced insights, and all premium features.
        </p>

        <button
          onClick={handleUpgrade}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity mb-3"
        >
          Upgrade to Pro
        </button>
        <button
          onClick={handleDismiss}
          className="w-full py-3 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:text-foreground hover:bg-secondary transition-colors"
        >
          Continue with limited access
        </button>
      </div>
    </div>
  );
}