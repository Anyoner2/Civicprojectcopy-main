import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Landing } from "./components/Landing";
import { CitizenDashboard } from "./components/CitizenDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { Login } from "./components/Login";
import { SignUp } from "./components/SignUp";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: "login", Component: Login },
      { path: "signup", Component: SignUp },
      { 
        path: "citizen", 
        element: (
          <ProtectedRoute requiredType="citizen">
            <CitizenDashboard />
          </ProtectedRoute>
        )
      },
      { 
        path: "admin", 
        element: (
          <ProtectedRoute requiredType="admin">
            <AdminDashboard />
          </ProtectedRoute>
        )
      },
    ],
  },
]);