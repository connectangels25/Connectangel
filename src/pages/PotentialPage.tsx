import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function PotentialPage() {
  const [searchParams] = useSearchParams();
  const countryParam = searchParams.get("country") || "";
  const navigate = useNavigate();
  const { profile, isTrialActive } = useAuth();
  const [iframeSrc, setIframeSrc] = useState<string>("/capacity/index.html");
  const [showExpiredPopup, setShowExpiredPopup] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const DASHBOARD_URL = "http://127.0.0.1:5000";

  (window as any).__POTENTIAL_API_URL = DASHBOARD_URL;

  useEffect(() => {
    (window as any).__POTENTIAL_API_URL = DASHBOARD_URL;
  }, [DASHBOARD_URL]);

  const syncThemeToIframe = useRef<(theme: string) => void>();

  useEffect(() => {
    const initialTheme = document.documentElement.classList.contains("light") ? "light" : "dark";
    (window as any).__POTENTIAL_THEME = initialTheme;
    
    let url = `/capacity/index.html?t=${Date.now()}&theme=${initialTheme}`;
    if (countryParam) {
      url += `&country=${encodeURIComponent(countryParam)}`;
    }
    setIframeSrc(url);
  }, [countryParam]);

  useEffect(() => {
    if (profile?.trial_started_at && !isTrialActive && profile?.plan !== 'pro') {
      setShowExpiredPopup(true);
    }
  }, [profile?.trial_started_at, isTrialActive, profile?.plan]);

  useEffect(() => {
    syncThemeToIframe.current = (theme: string) => {
      const t = theme === "light" ? "light" : "dark";
      (window as any).__POTENTIAL_THEME = t;
      iframeRef.current?.contentWindow?.postMessage({ type: "theme", theme: t }, "*");
    };

    const observer = new MutationObserver(() => {
      const isLight = document.documentElement.classList.contains("light");
      syncThemeToIframe.current!(isLight ? "light" : "dark");
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      <Navbar />

      <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-background via-background/95 to-secondary/30 relative">
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          className="w-full flex-1 border-0 bg-transparent"
          title="ConnectAngels Capacity Dashboard"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>

      {/* Trial Expired Popup */}
      {showExpiredPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowExpiredPopup(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden z-10 p-6 text-center">
            <button
              onClick={() => setShowExpiredPopup(false)}
              className="absolute top-3 right-3 h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Free Trial Ended</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Your 26-day free trial has expired. Upgrade to the Pro Plan to continue viewing potential opportunities and unlock all premium features.
            </p>
            <button
              onClick={() => { setShowExpiredPopup(false); navigate("/pricing"); }}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
