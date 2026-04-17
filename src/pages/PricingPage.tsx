import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, Zap, Sparkles, Shield, MessageCircle, HelpCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import logo from "@/assets/logo.png";

const FREE_FEATURES = [
  "Basic startup knowledge",
  "5 step roadmap",
  "Challenges Support",
  "Basic performance",
  "Limited web access",
];

const PRO_FEATURES = [
  "USP analysis",
  "TAM/SAM/SOM calculator",
  "Startup plan builder",
  "Live competitor check",
  "Challenges and solutions support",
];

const PREMIUM_FEATURES = [
  "Unlimited everything",
  "Research Paper",
  "Legal compliance help",
  "Pitch Presentation",
  "Financial Revenue projection support",
  "Regulatory guide",
  "Skills Gap",
  "Mentor Support",
];

const FAQ_ITEMS = [
  {
    q: "Can I change plans later?",
    a: "Yes, you can upgrade or downgrade at any time from your dashboard.",
  },
  {
    q: "What counts as a Message?",
    a: "One credit equals one standard API execution or database query.",
  },
  {
    q: "Is there a setup fee?",
    a: "No, there are zero setup fees across all of our plans.",
  },
  {
    q: "Do you offer discounts?",
    a: "We offer non-profit and student discounts upon verification.",
  },
];

const FOOTER_PRODUCT = ["Runtime", "Global DB", "Edge Functions", "Security"];
const FOOTER_RESOURCES = ["Documentation", "Guides", "API Reference", "Community"];
const FOOTER_COMPANY = ["About Us", "Careers", "Privacy Policy", "Terms of Service"];

export default function PricingPage() {
  const navigate = useNavigate();
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
              <Zap className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Essential AI guidance for first-time founders to validate their initial vision.
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">$0</span>
              <span className="text-muted-foreground text-sm"> /month</span>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground tracking-wider mb-2">CREDITS INCLUDED</p>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-border text-sm text-foreground">
                20 Messages
                <ChevronIcon />
              </div>
            </div>

            <div className="flex-1 space-y-3 mb-6">
              {FREE_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              Get Started Free
            </button>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border border-primary/50 bg-card p-6 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
              MOST POPULAR
            </div>
            <div className="flex items-start justify-between mb-2 mt-2">
              <h3 className="text-xl font-bold text-foreground">Pro</h3>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Deep-dive research and unlimited strategic planning for serious entrepreneurs.
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">
                ${isAnnual ? "23" : "29"}
              </span>
              <span className="text-muted-foreground text-sm"> /month</span>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground tracking-wider mb-2">CREDITS INCLUDED</p>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-border text-sm text-foreground">
                100 Messages
                <ChevronIcon />
              </div>
            </div>

            <p className="text-xs font-semibold text-primary tracking-wider mb-3">EVERYTHING IN FREE</p>
            <div className="flex-1 space-y-3 mb-6">
              {PRO_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              Upgrade to Pro
            </button>
          </div>

          {/* Premium */}
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-foreground">Premium</h3>
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Tailored AI solutions and dedicated resources for venture studios and accelerators.
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">Custom</span>
            </div>

            <p className="text-xs font-semibold text-primary tracking-wider mb-3">EVERYTHING IN FREE, PRO</p>
            <div className="flex-1 space-y-3 mb-6">
              {PREMIUM_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            <button className="w-full py-3 rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-secondary transition-colors">
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-16 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">Still have questions?</h2>
        <p className="text-muted-foreground text-sm mb-10 max-w-xl mx-auto">
          Check out our extensive FAQ or hop into a live chat with our support team. We're here to help you choose the right path for your project.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQ_ITEMS.map((item) => (
            <div key={item.q} className="rounded-xl border border-border bg-card p-5 text-left">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="h-4 w-4 text-primary flex-shrink-0" />
                <h4 className="text-sm font-bold text-foreground">{item.q}</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>

        {/* Social icons */}
        <div className="flex justify-center gap-4 mt-10">
          {["P", "I", "S", "L"].map((icon) => (
            <div key={icon} className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors cursor-pointer">
              <span className="text-xs font-bold">{icon}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={logo} alt="ConnectAngels" className="h-10 w-10" />
              <span className="text-primary font-bold">ConnectAngels</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Building the future of decentralized infrastructure with high-performance edge computing.
            </p>
          </div>
          <FooterCol title="PRODUCT" links={FOOTER_PRODUCT} />
          <FooterCol title="RESOURCES" links={FOOTER_RESOURCES} />
          <FooterCol title="COMPANY" links={FOOTER_COMPANY} />
        </div>
        <div className="border-t border-border px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
          <p className="text-xs text-muted-foreground">© 2026 ConnectAngels Inc. All rights reserved.</p>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-3 w-3 rounded-sm bg-muted" />
            ))}
          </div>
        </div>
      </footer>

      {/* Floating Chat */}
      <button
        onClick={() => navigate("/chat")}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center"
        aria-label="Chat with us"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted-foreground">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-bold text-muted-foreground tracking-wider mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link}>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{link}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
