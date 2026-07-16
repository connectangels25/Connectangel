import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Crown, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function PotentialPage() {
  const navigate = useNavigate();
  const { isTrialExpired } = useAuth();
  const [iframeSrc, setIframeSrc] = useState<string>("/capacity/index.html");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (isTrialExpired) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center mb-6 border border-amber-500/20">
              <Lock className="w-10 h-10 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Plan Expired</h1>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Your current plan has expired. To visit this page and access potential matching, please upgrade to Pro.
            </p>
            <button
              onClick={() => navigate("/pricing")}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    );
  }

  const DASHBOARD_URL = "http://127.0.0.1:5000";

  (window as any).__POTENTIAL_API_URL = DASHBOARD_URL;

  useEffect(() => {
    (window as any).__POTENTIAL_API_URL = DASHBOARD_URL;
  }, [DASHBOARD_URL]);

  const syncThemeToIframe = useRef<(theme: string) => void>();

  useEffect(() => {
    const initialTheme = document.documentElement.classList.contains("light") ? "light" : "dark";
    (window as any).__POTENTIAL_THEME = initialTheme;
    setIframeSrc(`/capacity/index.html?t=${Date.now()}&theme=${initialTheme}`);
  }, []);

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
    </div>
  );
}