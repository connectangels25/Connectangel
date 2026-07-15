import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const FREE_NAV = ["/pricing", "/login", "/signup", "/admin"];

const PendingPlanGate = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profileLoading, hasPlan } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (profileLoading) return null;

  if (user && !hasPlan && !FREE_NAV.includes(location.pathname)) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
};

export default PendingPlanGate;
