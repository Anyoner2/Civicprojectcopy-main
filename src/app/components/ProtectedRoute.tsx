import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredType?: "citizen" | "admin";
}

export function ProtectedRoute({ children, requiredType }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page, saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific user type is required, check it
  if (requiredType && user?.role !== requiredType) {
    // Redirect to appropriate dashboard
    return <Navigate to={user?.role === "admin" ? "/admin" : "/citizen"} replace />;
  }

  return <>{children}</>;
}
