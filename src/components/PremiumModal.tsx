import { useChatContext } from "@/context/useChatContext";

export default function PremiumModal() {
  const { showPremium, setShowPremium } = useChatContext();

  if (!showPremium) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-xl font-bold text-foreground mb-2">Upgrade to Premium</h2>
        <p className="text-muted-foreground text-sm mb-6">
          You've reached your free limit. Upgrade to continue using ConnectAngels with unlimited messages.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPremium(false)}
            className="flex-1 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}
