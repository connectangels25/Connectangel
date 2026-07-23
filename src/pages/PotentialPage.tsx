import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Crown, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function PotentialPage() {
  const [searchParams] = useSearchParams();
  const countryParam = searchParams.get("country") || "";
  const navigate = useNavigate();
  const { isTrialExpired, user, profile, daysRemaining, refreshProfile } = useAuth();
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

  const DASHBOARD_URL = "https://freezing-botch-glove.ngrok-free.dev";

  (window as any).__POTENTIAL_API_URL = DASHBOARD_URL;

  useEffect(() => {
    (window as any).__POTENTIAL_API_URL = DASHBOARD_URL;
  }, [DASHBOARD_URL]);

  useEffect(() => {
    (window as any).__POTENTIAL_USER_STATE = {
      plan: profile?.is_admin ? 'admin' : (profile?.plan || 'free'),
      daysRemaining: daysRemaining,
      clicksToday: profile?.potential_clicks_today || 0,
      lastClickDate: profile?.last_potential_click_date || '',
      isTrialExpired: isTrialExpired
    };
  }, [profile, daysRemaining, isTrialExpired]);

  useEffect(() => {
    (window as any).__RECORD_POTENTIAL_SEARCH_SUCCESS = async () => {
      if (!user) return;
      const todayStr = new Date().toLocaleDateString('en-CA');
      const lastClickDate = profile?.last_potential_click_date || '';
      const currentClicksToday = profile?.potential_clicks_today || 0;
      const newClicksToday = (lastClickDate === todayStr) ? (currentClicksToday + 1) : 1;

      const { error } = await supabase
        .from("profiles")
        .update({
          potential_clicks_today: newClicksToday,
          last_potential_click_date: todayStr
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating potential click count:", error);
      }
      // Update window state synchronously for instant UI update inside iframe
      if ((window as any).__POTENTIAL_USER_STATE) {
        (window as any).__POTENTIAL_USER_STATE.clicksToday = newClicksToday;
        (window as any).__POTENTIAL_USER_STATE.lastClickDate = todayStr;
      }

      await refreshProfile();
    };
  }, [user, profile, refreshProfile]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "navigate") {
        navigate(event.data.url);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

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