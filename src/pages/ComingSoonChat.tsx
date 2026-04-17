import { Lock } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function ComingSoonChat() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="relative flex items-center justify-center" style={{ height: "calc(100vh - 65px)" }}>
        {/* Blurred background to mimic chat UI */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-card via-secondary to-background opacity-60 blur-xl" />
          <div className="absolute left-0 top-0 w-[320px] h-full bg-card/30 blur-md" />
          <div className="absolute left-[320px] top-0 right-0 h-full bg-background/30 blur-md" />
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4">
          <div className="h-16 w-16 rounded-full bg-secondary border border-border flex items-center justify-center mb-6">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">Coming Soon</h1>
          <p className="text-muted-foreground text-lg max-w-md">
            We're working on something exciting. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  );
}
