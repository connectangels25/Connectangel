import { motion } from "framer-motion";
import { TrendingUp, Users, BarChart3 } from "lucide-react";

const TRENDING = [
  {
    name: "AI & Machine Learning",
    growth: "+145%",
    startups: "250+",
    color: "from-purple-500 to-indigo-500",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop"
  },
  {
    name: "Sustainable Tech",
    growth: "+82%",
    startups: "120+",
    color: "from-emerald-500 to-teal-500",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070&auto=format&fit=crop"
  },
  {
    name: "Fintech 2.0",
    growth: "+65%",
    startups: "180+",
    color: "from-blue-500 to-cyan-500",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=2071&auto=format&fit=crop"
  }
];

export default function TrendingIndustries() {
  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-6 lg:px-12 xl:px-20">
        <div className="text-center mb-10">
          <span className="text-primary font-bold uppercase tracking-widest text-xs mb-4 block italic">Market Insights</span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">Trending <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Industries</span></h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TRENDING.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group relative h-[320px] rounded-[28px] overflow-hidden border border-border"
            >
              <img 
                src={item.image} 
                alt={item.name} 
                className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color}`}>
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-foreground font-bold">{item.growth} Growth</span>
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-6 italic">{item.name}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-background/50 backdrop-blur-md border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Startups</div>
                    <div className="text-lg font-bold text-foreground">{item.startups}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-background/50 backdrop-blur-md border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Activity</div>
                    <div className="text-lg font-bold text-foreground">High</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button className="px-12 py-4 rounded-full bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform">
            See Market Analysis
          </button>
        </div>
      </div>
    </section>
  );
}
