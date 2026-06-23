import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"citizen" | "admin">("citizen");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(email, password, userType);
      
      if (success) {
        toast.success(`Logged in successfully as ${userType}`);
        
        // Get the page they were trying to visit, or redirect to dashboard
        const from = (location.state as any)?.from?.pathname || `/${userType}`;
        navigate(from, { replace: true });
      } else {
        toast.error("Login failed", {
          description: "Please check your credentials and account type"
        });
      }
    } catch (error: any) {
      // Display specific error message from backend (e.g., role mismatch)
      toast.error("Login failed", {
        description: error.message || "Please try again"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <MapPin className="size-10 text-blue-600" />
          <span className="text-2xl font-semibold">Nairobi Civic Report</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Sign in to your account to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* User Type Selection */}
              <div className="space-y-2">
                <Label>Login as</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={userType === "citizen" ? "default" : "outline"}
                    onClick={() => setUserType("citizen")}
                    className="w-full"
                  >
                    Citizen
                  </Button>
                  <Button
                    type="button"
                    variant={userType === "admin" ? "default" : "outline"}
                    onClick={() => setUserType("admin")}
                    className="w-full"
                  >
                    Administrator
                  </Button>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Login Button */}
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              {/* Sign Up Link */}
              <div className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign up
                </button>
              </div>

              {/* Back to Home */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Back to home
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}