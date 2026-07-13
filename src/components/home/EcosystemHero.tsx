import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, Users, Globe, Rocket, ShieldCheck, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EcosystemHero() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  const floatingVariants = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-16 px-4">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background" />
        
        {/* Startup/Trading Themed Background Image */}
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-[0.15] dark:opacity-[0.25]" 
        />
        
        {/* Animated Glow Orbs */}
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none"
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 xl:px-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-left"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-8 backdrop-blur-md shadow-lg shadow-primary/5"
            >
              <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
              THE FUTURE OF GLOBAL INNOVATION
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-black text-foreground mb-8 leading-[1.1] tracking-tight">
              Invest in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-[length:200%_auto] animate-gradient-x">
                Visionary
              </span> <br />
              Ideas.
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed font-medium">
              Join the world's most elite network of startups, investors, and incubators. 
              Accelerating growth through strategic global connections.
            </p>

            <div className="flex flex-wrap gap-5">
              <button 
                onClick={() => navigate("/signup")}
                className="px-10 py-5 rounded-2xl bg-primary text-primary-foreground font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group shadow-2xl shadow-primary/20"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>
              <button className="px-10 py-5 rounded-2xl bg-card border border-border text-foreground font-bold hover:bg-secondary transition-all flex items-center gap-3 backdrop-blur-xl group">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
                Watch Video
              </button>
            </div>

            {/* Enhanced Stats */}
            <div className="mt-16 flex flex-wrap items-center gap-10">
              {[
                { label: "Startups", value: "500+", icon: Rocket },
                { label: "Investors", value: "120+", icon: Users },
                { label: "Countries", value: "45+", icon: Globe },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center group-hover:border-primary transition-colors">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-foreground">{stat.value}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            {/* Main Interactive Image Card */}
            <div className="relative z-10 p-4 rounded-[48px] bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="rounded-[36px] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070&auto=format&fit=crop" 
                  alt="Elite Networking" 
                  className="w-full h-[450px] object-cover opacity-60 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110"
                />
              </div>
              
              {/* Overlay Content */}
              <div className="absolute bottom-10 left-10 right-10 p-8 rounded-3xl bg-background/80 backdrop-blur-xl border border-white/10 shadow-2xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-secondary overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-background bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                      +12
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-500 text-xs font-black">
                    LIVE NETWORK
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground">Global Investor Summit 2025</h3>
                <p className="text-sm text-muted-foreground mt-1">Happening in Qatar • Join 450+ attendees</p>
              </div>
            </div>

            {/* Fixed & Better Visible Floating Elements */}
            <motion.div 
              variants={floatingVariants}
              animate="animate"
              className="hidden sm:flex absolute -top-6 -right-6 p-6 rounded-3xl bg-card border border-border backdrop-blur-xl shadow-2xl z-20 items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-lg font-black text-foreground">50+ Investors</div>
                <div className="text-xs text-muted-foreground font-bold">Recently Joined</div>
              </div>
            </motion.div>

            <motion.div 
              variants={floatingVariants}
              animate="animate"
              transition={{ delay: 0.5 }}
              className="hidden sm:flex absolute top-1/2 -left-12 p-5 rounded-3xl bg-card border border-border backdrop-blur-xl shadow-2xl z-20 items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <div className="text-lg font-black text-foreground">$12M+</div>
                <div className="text-xs text-muted-foreground font-bold">Funds Raised</div>
              </div>
            </motion.div>

            <motion.div 
              variants={floatingVariants}
              animate="animate"
              transition={{ delay: 1 }}
              className="hidden sm:block absolute -bottom-8 -right-12 p-5 rounded-3xl bg-card border border-border backdrop-blur-xl shadow-2xl z-20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-sm font-black text-foreground">Verified Platform</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Dynamic Background Orbs (Decorative) */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none" />
    </section>
  );
}
