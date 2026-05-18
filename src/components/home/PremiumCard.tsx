import { Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PremiumCard() {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate('/pricing')}
      className="rounded-[28px] p-6 bg-card border border-[#FFD700]/30 flex flex-col items-center text-center justify-center min-h-[300px] relative overflow-hidden group cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
        <Crown className="w-10 h-10 text-white" />
      </div>

      <h3 className="text-3xl font-bold text-foreground mb-4">Go Premium</h3>
      
      <p className="text-muted-foreground mb-8 leading-relaxed max-w-[240px]">
        Unlock exclusive insights, detailed analytics, and premium networking opportunities.
      </p>

      <button className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold group-hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/25">
        <Sparkles className="w-4 h-4" />
        Upgrade Now
      </button>
    </div>
  );
}
