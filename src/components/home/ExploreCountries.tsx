import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const COUNTRIES = [
  { name: "Greece", flag: "🇬🇷", img: "https://flagcdn.com/w80/gr.png" },
  { name: "Malaysia", flag: "🇲🇾", img: "https://flagcdn.com/w80/my.png" },
  { name: "Philippines", flag: "🇵🇭", img: "https://flagcdn.com/w80/ph.png" },
  { name: "Indonesia", flag: "🇮🇩", img: "https://flagcdn.com/w80/id.png" },
  { name: "Bahrain", flag: "🇧🇭", img: "https://flagcdn.com/w80/bh.png" },
  { name: "Serbia", flag: "🇷🇸", img: "https://flagcdn.com/w80/rs.png" },
  { name: "Qatar", flag: "🇶🇦", img: "https://flagcdn.com/w80/qa.png" },
  { name: "UAE", flag: "🇦🇪", img: "https://flagcdn.com/w80/ae.png" },
  { name: "USA", flag: "🇺🇸", img: "https://flagcdn.com/w80/us.png" },
  { name: "UK", flag: "🇬🇧", img: "https://flagcdn.com/w80/gb.png" },
  { name: "India", flag: "🇮🇳", img: "https://flagcdn.com/w80/in.png" },
  { name: "Singapore", flag: "🇸🇬", img: "https://flagcdn.com/w80/sg.png" },
  { name: "Germany", flag: "🇩🇪", img: "https://flagcdn.com/w80/de.png" },
  { name: "France", flag: "🇫🇷", img: "https://flagcdn.com/w80/fr.png" },
  { name: "Japan", flag: "🇯🇵", img: "https://flagcdn.com/w80/jp.png" },
];
export default function ExploreCountries() {
  const navigate = useNavigate();
  const displayCountries = [...COUNTRIES, ...COUNTRIES];

  return (
    <section className="py-8 bg-background overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 xl:px-20 mb-8 flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Explore by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Countries</span>
        </h2>
        <button className="flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-primary transition-colors group">
          Explore More
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      <div className="relative">
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="flex overflow-hidden">
          <div className="flex gap-4 px-4 animate-marquee">
            {displayCountries.map((country, idx) => {
              const getSearchCountryName = (name: string) => {
                if (name === "USA") return "United States";
                if (name === "UK") return "United Kingdom";
                if (name === "UAE") return "United Arab Emirates";
                return name;
              };
              return (
                <div
                  key={idx}
                  onClick={() => navigate(`/potential?country=${encodeURIComponent(getSearchCountryName(country.name))}`)}
                  className="flex-shrink-0 flex items-center gap-3 px-6 py-3 rounded-xl bg-card border border-border shadow-sm hover:border-primary/40 transition-all cursor-pointer min-w-[180px]"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-border flex-shrink-0">
                    <img 
                      src={country.img} 
                      alt={country.name} 
                      className="w-full h-full object-cover scale-150"
                    />
                  </div>
                  <span className="text-base font-semibold text-foreground whitespace-nowrap">
                    {country.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="absolute top-0 left-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      </div>
      {/* Progress Dots (Visual only, to match screenshot) */}
      <div className="flex justify-center gap-1.5 mt-10">
        {Array.from({ length: 25 }).map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full bg-muted-foreground/20 transition-all ${i === 20 ? "w-4 bg-foreground/60" : "w-1.5"}`} 
          />
        ))}
      </div>
    </section>
  );
}
