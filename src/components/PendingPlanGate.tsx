import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoadingScreen from "./LoadingScreen";

const FREE_NAV = ["/pricing", "/login", "/signup", "/admin"];

const PendingPlanGate = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profileLoading, hasPlan } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Verifying your account..." />;
  }

  if (profileLoading) return null;

  if (user && !hasPlan && !FREE_NAV.includes(location.pathname)) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
};

export default PendingPlanGate;
