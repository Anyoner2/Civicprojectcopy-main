import { Outlet } from "react-router";
import { AuthProvider } from "../contexts/AuthContext";

export function Root() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}