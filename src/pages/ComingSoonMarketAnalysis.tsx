import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function ComingSoonMarketAnalysis() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="relative flex-1 flex items-center justify-center">
        {/* Blurred background to mimic chart UI */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-card via-secondary to-background opacity-60 blur-xl" />
          <div className="absolute left-0 top-0 w-[320px] h-full bg-card/30 blur-md" />
          <div className="absolute left-[320px] top-0 right-0 h-full bg-background/30 blur-md" />
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="h-16 w-16 rounded-full bg-secondary border border-border flex items-center justify-center mb-6"
          >
            <BarChart3 className="h-7 w-7 text-primary" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-foreground mb-3"
          >
            Market Analysis Coming Soon
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-muted-foreground text-lg max-w-md"
          >
            We're working on something exciting. Stay tuned!
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex items-center gap-1.5"
          >
            <span className="text-muted-foreground text-sm">We're working on it</span>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
                className="h-1.5 w-1.5 rounded-full bg-foreground"
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}