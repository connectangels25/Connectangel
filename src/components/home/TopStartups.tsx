import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import PremiumCard from "./PremiumCard";

export default function TopStartups() {
  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-6 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">
                Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Startups</span>
              </h2>
            </div>
            <p className="text-muted-foreground">Handpicked high-potential startups from across the network.</p>
          </div>
          <button className="text-primary hover:text-primary/80 font-medium">View All Startups</button>
        </div>

        <div className="flex justify-center">
          <div className="max-w-md w-full">
            <PremiumCard />
          </div>
        </div>
      </div>
    </section>
  );
}
