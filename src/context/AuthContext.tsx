import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  is_admin: boolean | null;
  trial_started_at: string | null;
  plan: string | null;
}

const TRIAL_DAYS = 26;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  daysRemaining: number;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  hasPlan: boolean;
  startTrial: () => Promise<void>;
  setPlan: (plan: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const isRedirectingRef = useRef(false);

  const fetchProfile = async (userId: string) => {
    setProfileLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, name, email, avatar_url, is_admin, trial_started_at, plan")
      .eq("id", userId)
      .maybeSingle();
    setProfile(data as Profile | null);
    setProfileLoading(false);
  };

  const daysRemaining = (() => {
    if (!user?.created_at) return TRIAL_DAYS;
    const start = new Date(user.created_at).getTime();
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, TRIAL_DAYS - Math.floor(elapsed / (1000 * 60 * 60 * 24)));
    return remaining;
  })();

  const isTrialActive = !!user && daysRemaining > 0 && profile?.plan !== 'pro';
  const isTrialExpired = !!user && daysRemaining === 0 && profile?.plan !== 'pro' && !profile?.is_admin;
  const hasPlan = !profile ? true : !!user || profile.plan === 'pro' || profile.is_admin === true;

  useEffect(() => {
    const handleSession = async (currentSession: Session | null) => {
      if (isRedirectingRef.current) return;

      if (currentSession?.user) {
        const user = currentSession.user;
        const isGoogle = user.app_metadata?.provider === "google";

        if (isGoogle) {
          const googleSignupIntent = localStorage.getItem('google_signup_intent') === 'true';
          localStorage.removeItem('google_signup_intent');

          if (googleSignupIntent) {
            const { data: existingProfile } = await supabase
              .from("profiles")
              .select("id")
              .eq("id", user.id)
              .maybeSingle();

            if (existingProfile) {
              isRedirectingRef.current = true;
              await supabase.auth.signOut();
              window.location.href = "/signup?error=already_registered";
              return;
            }
            // No profile = new user → let through (Google sign-up works)
          }
        }
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const startTrial = async () => {
    if (!user) return;
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("profiles")
      .update({ trial_started_at: now, plan: 'free' })
      .eq("id", user.id);
    if (!error) {
      setProfile((prev) => prev ? { ...prev, trial_started_at: now, plan: 'free' } : prev);
    }
  };

  const setPlan = async (plan: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ plan })
      .eq("id", user.id);
    if (!error) {
      setProfile((prev) => prev ? { ...prev, plan } : prev);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      return { error: error.message };
    }
    if (data?.user?.identities?.length === 0) {
      return { error: "This email is already registered. Please sign in." };
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message === "Invalid login credentials") {
        return { error: "Invalid email or password. Please try again or sign up." };
      }
      return { error: error.message };
    }
    return { error: null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, profileLoading, daysRemaining, isTrialActive, isTrialExpired, hasPlan, startTrial, setPlan, signUp, signIn, signInWithGoogle, signOut }}>
      {loading ? (
        <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center">
          <div className="relative flex flex-col items-center gap-6">
            {/* Animated rings */}
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-primary animate-spin [animation-duration:1.5s]" />
              <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-lg font-semibold text-foreground tracking-tight">ConnectAngel</p>
              <p className="text-sm text-muted-foreground">Verifying your account...</p>
            </div>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};
