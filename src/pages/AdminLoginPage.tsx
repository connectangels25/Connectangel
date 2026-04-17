import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const checkExistingSession = async () => {
      if (user) {
        setIsLoading(true);
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.is_admin) {
          navigate("/admindashboard");
        } else {
          setIsLoading(false);
        }
      }
    };
    if (!authLoading) {
      checkExistingSession();
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Admin Login: Starting sign in for", email);
      
      // Sign in with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error("Admin Login: Auth error", authError);
        toast.error(authError.message);
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error("Authentication failed.");
        setIsLoading(false);
        return;
      }

      console.log("Admin Login: Auth successful, fetching profile for", authData.user.id);

      // Check if user is admin - using any to bypass type issues if needed
      const { data: profile, error: profileError } = await (supabase
        .from("profiles") as any)
        .select("is_admin")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Admin Login: Profile fetch error", profileError);
        // This is often where "Failed to fetch" can happen if there's a DB/RLS issue
        toast.error(`Database error: ${profileError.message || "Failed to fetch profile"}`);
        setIsLoading(false);
        return;
      }

      console.log("Admin Login: Profile found", profile);

      if (!profile) {
        await supabase.auth.signOut();
        toast.error("Profile record not found in the database.");
        setIsLoading(false);
        return;
      }

      if (!profile.is_admin) {
        // Not an admin — sign them out immediately
        await supabase.auth.signOut();
        toast.error("Access denied. Your account is not marked as an administrator.");
        setIsLoading(false);
        return;
      }

      toast.success("Welcome back, Admin!");
      navigate("/admindashboard");
    } catch (err: any) {
      console.error("Admin Login: Unexpected catch error", err);
      toast.error(`Error: ${err.message || "Something went wrong. Please check your connection."}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080F] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-4">
        <img src={logo} alt="ConnectAngels" className="h-8 w-8" />
        <span className="text-base font-bold text-white/90">ConnectAngels</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F19] shadow-2xl overflow-hidden">
            {/* Header section */}
            <div className="px-8 pt-8 pb-6 text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-5 shadow-lg shadow-violet-600/20">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Admin Portal</h1>
              <p className="text-sm text-gray-400">
                Authorized personnel only. Enter your admin credentials.
              </p>
            </div>

            {/* Form */}
            <div className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      type="email"
                      placeholder="admin@connectangels.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-[#131827] border-[#1F2937] text-white placeholder:text-gray-500 h-11 focus:border-violet-500 focus:ring-violet-500/20"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-[#131827] border-[#1F2937] text-white placeholder:text-gray-500 h-11 focus:border-violet-500 focus:ring-violet-500/20"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-violet-600/20 transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  {isLoading ? "Verifying..." : "Sign In to Admin"}
                  {!isLoading && <ArrowRight className="w-5 h-5 ml-1" />}
                </Button>
              </form>

              {/* Info */}
              <div className="mt-6 p-3 rounded-xl bg-violet-600/10 border border-violet-600/20">
                <p className="text-xs text-violet-300 text-center leading-relaxed">
                  🔒 This is a restricted area. Only authorized admin accounts can
                  access the management dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-600 mt-6">
            © {new Date().getFullYear()} ConnectAngels. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
