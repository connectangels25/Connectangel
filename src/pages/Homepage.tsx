import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import EcosystemHero from "@/components/home/EcosystemHero";
import ExploreCountries from "@/components/home/ExploreCountries";
import TopStartups from "@/components/home/TopStartups";
import ExploreIndustries from "@/components/home/ExploreIndustries";
import TopIncubators from "@/components/home/TopIncubators";
import TrendingEvents from "@/components/home/TrendingEvents";
import TrendingIndustries from "@/components/home/TrendingIndustries";
import { MessageCircle, ArrowUp, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

export default function Homepage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Ensure Navbar is present and consistent */}
      <Navbar />

      <main>
        <EcosystemHero />
        <ExploreCountries />
        <TrendingEvents />
        <TrendingIndustries />
        <ExploreIndustries />
        <TopIncubators />
        <TopStartups />
      </main>

      {/* Modern Ecosystem Footer */}
      <footer className="bg-card border-t border-border pt-20 pb-10">
        <div className="container mx-auto px-6 lg:px-12 xl:px-20">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center mb-6">
                <img src={logo} alt="ConnectAngels" className="h-12 sm:h-14 w-auto" />
              </div>
              <p className="text-muted-foreground leading-relaxed mb-8">
                The leading global ecosystem for startups, investors, and incubators. 
                Bridging the gap between innovation and capital.
              </p>
              <div className="flex gap-4">
                {["Twitter", "LinkedIn", "Instagram", "Discord"].map((social) => (
                  <a 
                    key={social} 
                    href="#" 
                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <div className="w-4 h-4 bg-muted-foreground rounded-sm" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-foreground font-bold mb-6">Platform</h4>
              <ul className="space-y-4">
                {["Explore Startups", "Find Investors", "Incubators", "Events", "Pricing"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-foreground font-bold mb-6">Company</h4>
              <ul className="space-y-4">
                {["About Us", "Our Mission", "Careers", "Blog", "Contact"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-foreground font-bold mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <span>connectangels25@gmail.com</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <span>+91 84220 60195</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-muted-foreground text-sm">
              © 2025 ConnectAngels Global. All rights reserved.
            </p>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
            </div>
            <button 
              onClick={scrollToTop}
              className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Top
              <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Chat Button */}
      <button
        onClick={() => navigate("/chat")}
        className="fixed bottom-8 right-8 z-50 h-16 w-16 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:scale-110 transition-transform flex items-center justify-center group"
      >
        <MessageCircle className="h-7 w-7 group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
}
