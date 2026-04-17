import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, User, Building2, Users, CreditCard, ChevronDown, ChevronRight, Shield, Clock, Globe, Network, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import logo from "@/assets/logo.png";

const SignupPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [creditPack, setCreditPack] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showEnterprise, setShowEnterprise] = useState(false);
  const [signupMethod, setSignupMethod] = useState<"email" | "phone">("email");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupMethod === "phone") {
      toast.error("Phone signup is not yet supported. Please use email.");
      return;
    }
    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!agreed) {
      toast.error("Please agree to the Terms of Service.");
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(email, password, fullName);
    setIsLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Account created! Check your email to verify your account.");
      navigate("/login");
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    setIsLoading(false);
    if (error) toast.error(error);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-[1000px] rounded-2xl border border-border overflow-hidden grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] bg-card">
          {/* Left Pane - Form */}
          <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Create your account</h1>
            <p className="text-muted-foreground text-sm mb-6">Join the decentralized revolution. Start building in minutes.</p>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <Button
                variant="outline"
                className="h-11 bg-secondary border-border text-foreground hover:bg-muted text-xs sm:text-sm"
                onClick={handleGoogleSignup}
                disabled={isLoading}
              >
                <svg className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="truncate">Google</span>
              </Button>
              <Button variant="outline" className="h-11 bg-secondary border-border text-foreground hover:bg-muted text-xs sm:text-sm" disabled={isLoading}>
                <Shield className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">SSO Enterprise</span>
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground tracking-wider font-medium whitespace-nowrap">OR SIGN UP WITH</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Signup Method Toggle */}
            <div className="flex rounded-lg bg-secondary p-1 mb-5">
              <button
                type="button"
                onClick={() => setSignupMethod("email")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  signupMethod === "email" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setSignupMethod("phone")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  signupMethod === "phone" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Phone className="w-4 h-4" />
                Phone
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Email/Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Alex Rivera"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                {signupMethod === "email" ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="alex@luminaflow.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Enterprise & Team Options */}
              <div className="border border-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowEnterprise(!showEnterprise)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Enterprise & Team Options</span>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium hidden sm:inline">Optional</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showEnterprise ? "rotate-180" : ""}`} />
                </button>
                {showEnterprise && (
                  <div className="px-4 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Company Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Acme Corp"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Team Size</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <select
                          value={teamSize}
                          onChange={(e) => setTeamSize(e.target.value)}
                          className="flex h-11 w-full rounded-md border border-border bg-secondary px-3 py-2 pl-10 text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                          disabled={isLoading}
                        >
                          <option value="" className="bg-card text-foreground">Select size</option>
                          <option value="1-10" className="bg-card text-foreground">1-10</option>
                          <option value="11-50" className="bg-card text-foreground">11-50</option>
                          <option value="51-200" className="bg-card text-foreground">51-200</option>
                          <option value="201-1000" className="bg-card text-foreground">201-1000</option>
                          <option value="1000+" className="bg-card text-foreground">1000+</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Initial Credit Pack */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Initial Credit Pack
                </label>
                <div className="relative">
                  <select
                    value={creditPack}
                    onChange={(e) => setCreditPack(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={isLoading}
                  >
                    <option value="" className="bg-card text-foreground">Select a credit pack</option>
                    <option value="starter" className="bg-card text-foreground">Starter — 100 Credits</option>
                    <option value="growth" className="bg-card text-foreground">Growth — 500 Credits</option>
                    <option value="enterprise" className="bg-card text-foreground">Enterprise — 2000 Credits</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Consent */}
              <div className="flex items-start gap-2">
                <Checkbox
                  id="agree-terms"
                  checked={agreed}
                  onCheckedChange={(v) => setAgreed(!!v)}
                  className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5"
                />
                <label htmlFor="agree-terms" className="text-sm text-muted-foreground cursor-pointer leading-snug">
                  I agree to the{" "}
                  <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
                  . I understand that my data will be used to enhance my experience.
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-[hsl(240,70%,60%)] hover:opacity-90 text-primary-foreground rounded-lg"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Create Your Account
                {!isLoading && <ArrowRight className="w-5 h-5 ml-1" />}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
            </p>
          </div>

          {/* Right Pane - Branding */}
          <div className="hidden lg:flex flex-col items-center justify-center p-10 bg-gradient-to-br from-primary/20 to-primary/10 text-center">
            <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
              <Network className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground leading-tight mb-8">
              Where Global Angels Discovers<br />Tomorrow's Unicorns.
            </h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-[280px] mb-6">
              <div className="bg-secondary/60 rounded-xl p-4 text-center">
                <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">99.99%</div>
                <div className="text-xs text-muted-foreground tracking-wider font-medium mt-1">UPTIME</div>
              </div>
              <div className="bg-secondary/60 rounded-xl p-4 text-center">
                <Globe className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">12,400+</div>
                <div className="text-xs text-muted-foreground tracking-wider font-medium mt-1">GLOBAL NODES</div>
              </div>
            </div>

            {/* Certification Badge */}
            <div className="flex items-center gap-2 bg-secondary/60 rounded-full px-4 py-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs text-foreground font-medium">SOC2 Type II Certified Platform</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Features */}
      <div className="max-w-[1000px] mx-auto w-full px-4 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-foreground font-semibold mb-1">24/7 Support</h3>
            <p className="text-muted-foreground text-sm">Our expert team is always here to help you scale.</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-foreground font-semibold mb-1">99.99% Uptime</h3>
            <p className="text-muted-foreground text-sm">Enterprise-grade infrastructure for your critical workloads.</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-foreground font-semibold mb-1">Global Network</h3>
            <p className="text-muted-foreground text-sm">12,400+ nodes across 50+ countries worldwide.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 flex items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground border-t border-border flex-wrap px-4">
        <span className="flex items-center gap-1">© Privacy Policy</span>
        <span className="flex items-center gap-1">© Terms of Service</span>
        <span className="flex items-center gap-1">© Help Center</span>
      </footer>
    </div>
  );
};

export default SignupPage;
