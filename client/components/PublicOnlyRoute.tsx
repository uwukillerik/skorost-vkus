import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user && isAdmin) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
