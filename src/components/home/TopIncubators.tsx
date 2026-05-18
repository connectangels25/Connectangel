import { motion } from "framer-motion";
import { Users, Globe, Award } from "lucide-react";
import PremiumCard from "./PremiumCard";

export default function TopIncubators() {
  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-6 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Incubators</span>
            </h2>
            <p className="text-muted-foreground">Partner with institutions that accelerate growth.</p>
          </div>
          <button className="text-primary hover:text-primary/80 font-medium">View All Incubators</button>
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
