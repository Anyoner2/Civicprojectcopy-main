import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import apiService from "../../services/api";

interface User {
  email: string;
  name: string;
  role: "citizen" | "admin";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, role: "citizen" | "admin") => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: "citizen" | "admin") => Promise<boolean>;
  logout: () => void;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage and verify token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem("nairobireport_user");
        const savedToken = localStorage.getItem("nairobireport_token");
        
        if (savedUser && savedToken) {
          // Verify token is still valid
          const response = await apiService.verifySession(savedToken);
          
          if (response.success && response.data) {
            setUser({
              email: response.data.email,
              name: response.data.name,
              role: response.data.role,
            });
            setAccessToken(savedToken);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem("nairobireport_user");
            localStorage.removeItem("nairobireport_token");
            setError("Session expired. Please log in again.");
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signup = async (email: string, password: string, name: string, role: "citizen" | "admin"): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await apiService.signup(email, password, name, role);
      
      if (response.success && response.user) {
        const userData: User = {
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
        };
        
        // Use a mock token - in real app, backend should return a token
        const mockToken = `token-${Date.now()}`;
        
        setUser(userData);
        setAccessToken(mockToken);
        localStorage.setItem("nairobireport_user", JSON.stringify(userData));
        localStorage.setItem("nairobireport_token", mockToken);
        return true;
      } else {
        throw new Error(response.error || "Signup failed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed";
      setError(errorMessage);
      console.error("Signup error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, role: "citizen" | "admin"): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await apiService.login(email, password, role);
      
      if (response.success && response.user && response.accessToken) {
        const userData: User = {
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
        };
        
        setUser(userData);
        setAccessToken(response.accessToken);
        localStorage.setItem("nairobireport_user", JSON.stringify(userData));
        localStorage.setItem("nairobireport_token", response.accessToken);
        return true;
      } else {
        throw new Error(response.error || "Invalid email or password");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      console.error("Login error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setError(null);
    localStorage.removeItem("nairobireport_user");
    localStorage.removeItem("nairobireport_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        signup,
        logout,
        accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}