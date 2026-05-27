import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";

export default function PotentialPage() {
  const [iframeSrc, setIframeSrc] = useState<string>("/capacity/index.html");

  // Read backend URL from environment variables or default to localhost
  const DASHBOARD_URL = (import.meta.env.VITE_POTENTIAL_API_URL || "http://127.0.0.1:5000").replace(/\/$/, "");

  // Expose the API URL globally to the iframe so that dashboard.js can load it
  useEffect(() => {
    (window as any).__POTENTIAL_API_URL = DASHBOARD_URL;
  }, [DASHBOARD_URL]);

  // Set fresh cache-buster URL on mount to force loading the latest scripts
  useEffect(() => {
    setIframeSrc(`/capacity/index.html?t=${Date.now()}`);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Navbar wrapper */}
      <div className="flex-shrink-0 z-20 bg-background/80 backdrop-blur-md">
        <Navbar />
      </div>

      {/* Main Content Area — Always loads the dashboard UI (instant load, no connection screen) */}
      <div className="flex-1 relative flex flex-col min-h-0 bg-gradient-to-b from-background via-background/95 to-secondary/30">
        <iframe
          id="dashboard-iframe"
          src={iframeSrc}
          className="w-full flex-1 border-0 bg-transparent"
          title="ConnectAngels Capacity Dashboard"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
