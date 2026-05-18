import { motion } from "framer-motion";
import { GraduationCap, Activity, Landmark, ShoppingBag, Cpu, Globe, Rocket, ShieldCheck, ArrowRight } from "lucide-react";

const INDUSTRIES = [
  { 
    name: "Education", 
    icon: GraduationCap, 
    color: "from-blue-500 to-cyan-500", 
    glow: "shadow-blue-500/20",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2070&auto=format&fit=crop"
  },
  { 
    name: "Healthcare", 
    icon: Activity, 
    color: "from-red-500 to-orange-500", 
    glow: "shadow-red-500/20",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop"
  },
  { 
    name: "Finance", 
    icon: Landmark, 
    color: "from-emerald-500 to-teal-500", 
    glow: "shadow-emerald-500/20",
    image: "https://images.unsplash.com/photo-1550565118-3a14e8d0386f?q=80&w=2070&auto=format&fit=crop"
  },
  { 
    name: "Ecommerce", 
    icon: ShoppingBag, 
    color: "from-purple-500 to-pink-500", 
    glow: "shadow-purple-500/20",
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=2089&auto=format&fit=crop"
  },
  { 
    name: "Technology", 
    icon: Cpu, 
    color: "from-indigo-500 to-purple-500", 
    glow: "shadow-indigo-500/20",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop"
  },
  { 
    name: "SaaS", 
    icon: Globe, 
    color: "from-sky-500 to-blue-500", 
    glow: "shadow-sky-500/20",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"
  },
  { 
    name: "Deep Tech", 
    icon: Rocket, 
    color: "from-amber-500 to-orange-500", 
    glow: "shadow-amber-500/20",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
  },
  { 
    name: "Security", 
    icon: ShieldCheck, 
    color: "from-slate-500 to-zinc-500", 
    glow: "shadow-slate-500/20",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
  },
];

export default function ExploreIndustries() {
  // Double the list for infinite scroll effect
  const displayIndustries = [...INDUSTRIES, ...INDUSTRIES];

  return (
    <section className="py-8 bg-background relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 xl:px-20 relative z-10 mb-8 flex items-center justify-between">
        <div>
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-primary font-bold uppercase tracking-[0.2em] text-xs mb-4 block"
          >
            Market Verticals
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-foreground"
          >
            Explore by <span className="italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Industries</span>
          </motion.h2>
        </div>
        <button className="flex items-center gap-2 text-sm font-bold text-primary hover:underline transition-all group">
          View All Verticals
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="relative">
        <div className="flex overflow-hidden">
          <motion.div 
            className="flex gap-6 px-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              duration: 40, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {displayIndustries.map((industry, idx) => (
              <motion.div
                key={idx}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="group relative p-6 rounded-[28px] bg-card border border-border hover:border-primary/30 transition-all cursor-pointer overflow-hidden min-w-[240px] h-[180px] flex flex-col items-center justify-center shadow-sm"
              >
                {/* Industry Background Image (Theme-Aware Opacity) */}
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center opacity-[0.05] dark:opacity-[0.15] group-hover:opacity-[0.1] dark:group-hover:opacity-[0.25] transition-opacity duration-500"
                  style={{ backgroundImage: `url(${industry.image})` }}
                />

                {/* Card Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${industry.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative z-10 text-center">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${industry.color} p-[1px] transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110 ${industry.glow} shadow-lg`}>
                    <div className="w-full h-full bg-card rounded-[15px] flex items-center justify-center transition-colors group-hover:bg-transparent">
                      <industry.icon className="w-6 h-6 text-foreground group-hover:text-white transition-colors duration-500" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {industry.name}
                  </h3>
                  
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Explore</span>
                    <ArrowRight className="w-3 h-3 text-primary" />
                  </div>
                </div>

                {/* Decorative Corner Accent */}
                <div className={`absolute -bottom-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br ${industry.color} opacity-10 blur-xl`} />
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Shadow Overlays */}
        <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      </div>

      {/* Progress Dots (Visual only) */}
      <div className="flex justify-center gap-1.5 mt-8">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full bg-muted-foreground/20 transition-all ${i === 15 ? "w-4 bg-primary/60" : "w-1.5"}`} 
          />
        ))}
      </div>
    </section>
  );
}
