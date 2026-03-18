import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
  email: string;
  name: string;
  type: "citizen" | "admin";
  password: string; // Mock password storage
}

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, type: "citizen" | "admin") => Promise<boolean>;
  signup: (email: string, password: string, name: string, type: "citizen" | "admin") => Promise<boolean>;
  logout: () => void;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Helper function to get users from localStorage
  const getUsers = (): User[] => {
    const users = localStorage.getItem("nairobireport_users");
    return users ? JSON.parse(users) : [];
  };

  // Helper function to save users to localStorage
  const saveUsers = (users: User[]) => {
    localStorage.setItem("nairobireport_users", JSON.stringify(users));
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("nairobireport_user");
    const savedToken = localStorage.getItem("nairobireport_token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setAccessToken(savedToken);
    }
  }, []);

  const signup = async (email: string, password: string, name: string, type: "citizen" | "admin"): Promise<boolean> => {
    try {
      console.log("Mock signup:", { email, name, type });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const users = getUsers();
      
      // Check if user already exists
      if (users.find(u => u.email === email)) {
        throw new Error("User already exists");
      }
      
      const newUser: User = {
        email,
        name,
        type,
        password, // In real app, this would be hashed
      };
      
      users.push(newUser);
      saveUsers(users);
      
      const userData = { email, name, type };
      setUser(userData);
      setAccessToken("mock-token-" + Date.now());
      localStorage.setItem("nairobireport_user", JSON.stringify(userData));
      localStorage.setItem("nairobireport_token", "mock-token-" + Date.now());
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string, type: "citizen" | "admin"): Promise<boolean> => {
    try {
      console.log("Mock login:", { email, type });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validate email format
      if (!email.includes("@")) {
        throw new Error("Invalid email format");
      }
      
      const users = getUsers();
      const foundUser = users.find(u => u.email === email);
      
      // User must exist
      if (!foundUser) {
        throw new Error("User not found. Please sign up first.");
      }
      
      // Check password
      if (foundUser.password !== password) {
        throw new Error("Invalid password");
      }
      
      // Check that login type matches registered type
      if (foundUser.type !== type) {
        throw new Error(`This account is registered as a ${foundUser.type}. You can only log in as a ${foundUser.type}.`);
      }
      
      const userData = { email: foundUser.email, name: foundUser.name, type: foundUser.type };
      setUser(userData);
      setAccessToken("mock-token-" + Date.now());
      localStorage.setItem("nairobireport_user", JSON.stringify(userData));
      localStorage.setItem("nairobireport_token", "mock-token-" + Date.now());
      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("nairobireport_user");
    localStorage.removeItem("nairobireport_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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