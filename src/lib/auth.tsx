import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";

type AppRole = "admin" | "supervisor" | "student";

interface User {
  _id: string;
  name: string;
  email: string;
  role: AppRole;
  matricNumber?: string;
  department?: string;
  level?: string;
  specialization?: string;
  maxStudents?: number;
  supervisor?: string;
  avatarPath?: string;
  avatarFileName?: string;
}

interface AuthContextType {
  user: User | null;
  role: AppRole | null;
  isLoading: boolean;
  signIn: (identifier: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, role: AppRole, additionalData?: any) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem("token");
    if (token) {
      // Validate token by making a request
      api.get("/auth/me").then(({ data }) => {
        setUser(data.user);
        setRole(data.user.role);
      }).catch(() => {
        localStorage.removeItem("token");
      }).finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const signIn = async (identifier: string, password: string) => {
    try {
      const { data } = await api.post("/auth/login", { identifier, password });
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setRole(data.user.role);
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.response?.data?.msg || "Login failed") };
    }
  };

  const signUp = async (email: string, password: string, name: string, role: AppRole, additionalData?: any) => {
    try {
      const { data } = await api.post("/auth/register", {
        email,
        password,
        name,
        role,
        ...additionalData
      });
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.response?.data?.msg || "Registration failed") };
    }
  };

  const signOut = async () => {
    localStorage.removeItem("token");
    setUser(null);
    setRole(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoading, signIn, signUp, signOut }}>
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

// Protected Route component
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/auth");
      } else if (allowedRoles && role && !allowedRoles.includes(role)) {
        // Redirect to appropriate dashboard based on role
        switch (role) {
          case "admin":
            navigate("/admin");
            break;
          case "supervisor":
            navigate("/supervisor");
            break;
          case "student":
            navigate("/student");
            break;
          default:
            navigate("/auth");
        }
      }
    }
  }, [user, role, isLoading, allowedRoles, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
