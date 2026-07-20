import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import LoadingScreen from "./LoadingScreen";

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsAdmin(data?.is_admin === true);
      });
  }, [user]);

  if (loading || isAdmin === null) {
    return <LoadingScreen message="Verifying access..." />;
  }

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
