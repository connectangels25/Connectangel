import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSession = async (currentSession: Session | null) => {
      if (currentSession?.user) {
        const user = currentSession.user;
        const isGoogle = user.app_metadata?.provider === "google";

        if (isGoogle) {
          // Check if user exists in the profiles table
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

          const profileExists = !!profile;

          if (!profileExists) {
            const createdAt = new Date(user.created_at).getTime();
            const now = Date.now();
            const isNewAccount = now - createdAt < 60000;

            if (isNewAccount) {
              // If it's a new account but profile doesn't exist yet (race condition with trigger),
              // we can try to create it here as a safety net or just wait.
              // For now, let's allow them to proceed as the trigger should handle it.
              console.log("New Google account detected, allowing profile creation trigger to complete.");
            } else {
              // Existing Google account but no profile found - this is the restricted case
              await supabase.auth.signOut();
              toast.error("Access denied. Your account is not authorized.");
              setSession(null);
              setUser(null);
              setLoading(false);
              window.location.href = "/signup";
              return;
            }
          }
        }
      }

      // ✅ allow normal flow
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
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

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
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
    <AuthContext.Provider value={{ session, user, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
