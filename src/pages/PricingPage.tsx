import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const CheckIcon = () => (
  <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const PricingPage = () => {
  const navigate = useNavigate();
  const { user, startTrial, setPlan, hasPlan } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);

  const handleTryFree = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    await startTrial();
    navigate("/");
  };

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    await setPlan("pro");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="text-center pt-16 pb-8 px-4">
        <span className="inline-block px-4 py-1.5 rounded-full border border-primary/40 text-primary text-xs font-semibold mb-6">
          Simple, Transparent Pricing
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
          Where Global Angels Discovers
          <br />
          Tomorrow's Unicorns.
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Choose the plan that fits your growth.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isAnnual ? "bg-primary" : "bg-muted"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-foreground transition-transform ${isAnnual ? "translate-x-6" : ""}`}
            />
          </button>
          <span className={`text-sm font-medium ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Annual
          </span>
          {isAnnual && (
            <span className="text-xs text-primary font-semibold">Save 20%</span>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-16 pt-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

          {/* Free Plan */}
          <div className="rounded-2xl border border-border bg-card p-8 flex flex-col hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Try Free for 26 Days</h3>
                <p className="text-sm text-muted-foreground mt-1">Perfect for getting started</p>
              </div>
              <span className="text-3xl font-bold text-foreground">₹0<span className="text-sm text-muted-foreground font-normal">/mo</span></span>
            </div>

            <div className="my-6 h-[1px] bg-border" />

            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-3 text-sm text-foreground">
                <CheckIcon />
                <span><strong>Model:</strong> meta-llama/llama-4-scout-17b-16e-instruct</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-foreground">
                <CheckIcon />
                <span><strong>Only 1 AI Opportunity Check per day</strong></span>
              </div>
              <div className="flex items-start gap-3 text-sm text-foreground">
                <CheckIcon />
                <span><strong>Unlimited searches</strong> of existing benchmark database</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-foreground">
                <CheckIcon />
                <span><strong>Event Discovery:</strong> Find and explore events seamlessly</span>
              </div>
            </div>

            <button onClick={handleTryFree} className="mt-8 w-full py-3 rounded-lg border border-border bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors">
              Try for Free for 26 Days
            </button>
          </div>

          {/* Paid Plan */}
          <div className="rounded-2xl border-2 border-primary bg-card p-8 flex flex-col relative shadow-[0_0_30px_rgba(var(--primary),0.1)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
              MOST POPULAR
            </div>

            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Pro Plan</h3>
                <p className="text-sm text-muted-foreground mt-1">For advanced analysis</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-foreground">₹{isAnnual ? Math.round(149 * 0.8 * 12) : 149}</span>
                <span className="text-sm text-muted-foreground font-normal">/{isAnnual ? 'yr' : 'mo'}</span>
              </div>
            </div>

            <div className="my-6 h-[1px] bg-border" />

            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-3 text-sm text-foreground">
                <CheckIcon />
                <span><strong>Everything in Free</strong></span>
              </div>
              <div className="flex items-start gap-3 text-sm text-foreground">
                <CheckIcon />
                <span><strong>Model:</strong> openai/gpt-oss-120b</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-foreground">
                <CheckIcon />
                <span><strong>Daily Calls:</strong> 5 calls per day per user</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-foreground">
                <CheckIcon />
                <span><strong>Advanced Search:</strong> Deeper graph analysis & insights</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-foreground">
                <CheckIcon />
                <span><strong>Priority Access:</strong> Faster processing & response times</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-foreground">
                <CheckIcon />
                <span><strong>Enhanced Limits:</strong> Designed for active users</span>
              </div>
            </div>

            <button onClick={handleSubscribe} className="mt-6 w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
              Subscribe Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
