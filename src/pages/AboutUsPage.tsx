import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Calendar, Sparkles, TrendingUp, Users, Mail, ArrowRight, ShieldCheck, Rocket } from "lucide-react";
import logo from "@/assets/logo.png";

export default function AboutUsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      <Navbar />

      <main className="flex-1">
        {/* 1. Hero / Mission Line */}
        <section className="relative px-6 pt-20 pb-16 text-center max-w-4xl mx-auto overflow-hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5" /> OUR MISSION
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground leading-tight tracking-tight mb-6">
            ConnectAngels helps founders, event hosts, and investors find each other.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Starting with high-impact events and expanding into a complete global ecosystem for early-stage innovation and funding.
          </p>
        </section>

        {/* 2. What We Do */}
        <section className="px-6 py-16 bg-secondary/30 border-y border-border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">What We Do</h2>
              <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                Practical, founder-first modules designed to eliminate friction between great ideas and capital.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Module 1: Events */}
              <div className="rounded-2xl bg-card border border-border p-7 flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Events</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Discover, register, and host live summits, demo days, and founder pitch competitions across global regions.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60">
                  <Link to="/events" className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
                    Explore Events <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Module 2: Potential */}
              <div className="rounded-2xl bg-card border border-border p-7 flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-5">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Potential</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Regional business potential and market insights helping entrepreneurs spot underserved industry opportunities.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60">
                  <Link to="/potential" className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
                    View Market Potential <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Module 3: Investor Network */}
              <div className="rounded-2xl bg-card border border-border p-7 flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      Coming Soon
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Investor Network</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Direct matchmaking connecting accredited angels and VCs with high-conviction founders raising pre-seed and seed rounds.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60">
                  <span className="text-xs font-semibold text-muted-foreground">In active development</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. The Story */}
        <section className="px-6 py-16 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">The Story</h2>
          </div>
          <div className="prose dark:prose-invert text-muted-foreground leading-relaxed text-base space-y-4">
            <p>
              Finding funding and real investor attention as an early-stage founder is often fragmented, expensive, and closed behind gatekeepers.
            </p>
            <p>
              We built ConnectAngels after seeing brilliant founders struggle to gain access to genuine demo days and cross-border angels, while investors spent hours sifting through uncurated pitch decks.
            </p>
            <p>
              Instead of an exclusive, invite-only club, we are building an open, event-driven ecosystem where founders showcase genuine traction, meet real investors, and accelerate their journey from idea to Series A.
            </p>
          </div>
        </section>

        {/* 4. The Team */}
        <section className="px-6 py-16 bg-secondary/20 border-t border-border">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">The Team</h2>
              <p className="text-sm text-muted-foreground">A focused, builder-led team passionate about early-stage startups.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  name: "Ahad Waknis",
                  role: "Founder & Lead Developer",
                  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces",
                },
                {
                  name: "Team Member 1",
                  role: "Co-Founder & Operations",
                  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces",
                },
                {
                  name: "Team Member 2",
                  role: "Product & Growth",
                  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces",
                },
              ].map((member, i) => (
                <div key={i} className="p-6 rounded-2xl bg-card border border-border text-center shadow-sm">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-primary/30"
                  />
                  <h3 className="font-bold text-base text-foreground mb-1">{member.name}</h3>
                  <p className="text-xs text-muted-foreground font-medium">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Where We're Headed */}
        <section className="px-6 py-14 max-w-3xl mx-auto text-center border-t border-border">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <Rocket className="w-3.5 h-3.5" /> ROADMAP
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Where We're Headed</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We are expanding beyond events into verified incubator partnerships, founder CSR initiatives, and intelligent investor syndication tools to support ventures from inception to scale.
          </p>
        </section>

        {/* 6. Contact & CTA */}
        <section className="px-6 py-16 bg-primary/5 border-t border-border text-center">
          <div className="max-w-xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Get in Touch</h2>
            <p className="text-sm text-muted-foreground">
              Have questions, feedback, or want to partner with us?
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-sm font-semibold text-foreground">
              <Mail className="w-4 h-4 text-primary" />
              <a href="mailto:connectangels25@gmail.com" className="hover:text-primary transition-colors">
                connectangels25@gmail.com
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => navigate("/events")}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg hover:opacity-90 transition-opacity"
              >
                Explore Events
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-6 py-3 rounded-xl border border-border bg-card text-foreground text-sm font-bold hover:bg-secondary transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © 2025 ConnectAngels Global. All rights reserved.
      </footer>
    </div>
  );
}
