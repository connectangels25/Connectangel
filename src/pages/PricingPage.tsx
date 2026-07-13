import { useState } from "react";
import Navbar from "@/components/Navbar";

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-foreground">Free</h3>
            </div>
            <div className="flex-1" />
          </div>

          {/* Pro */}
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-foreground">Pro</h3>
            </div>
            <div className="flex-1" />
          </div>

          {/* Premium */}
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-foreground">Premium</h3>
            </div>
            <div className="flex-1" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
