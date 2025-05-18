// src/context/auth-context.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const authToken = Cookies.get("authToken");

      if (!authToken) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Validate token with API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_GO_API_URL}/api/validate-token`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        setIsAuthenticated(false);
        setUser(null);
        Cookies.remove("authToken");
        localStorage.removeItem("userIsAuthenticated");
        localStorage.removeItem("auth");
        return;
      }

      // Get user profile
      const profileResponse = await fetch(
        `${process.env.NEXT_PUBLIC_GO_API_URL}/api/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (profileResponse.ok) {
        const userData = await profileResponse.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_GO_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Invalid email or password",
        };
      }

      // Store authentication token in cookie
      Cookies.set("authToken", data.token, {
        expires: 7, // 7 days
        path: "/",
      });

      // Set local storage flags
      localStorage.setItem("userIsAuthenticated", "true");
      localStorage.setItem("auth", JSON.stringify({ userId: data.user.id }));

      // Update auth state
      setIsAuthenticated(true);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred during login",
      };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_GO_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Registration failed",
        };
      }

      // Store authentication token in cookie
      Cookies.set("authToken", data.token, {
        expires: 7, // 7 days
        path: "/",
      });

      // Set localStorage flags
      localStorage.setItem("userIsAuthenticated", "true");
      localStorage.setItem("auth", JSON.stringify({ userId: data.user.id }));

      // Update auth state
      setIsAuthenticated(true);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred during registration",
      };
    }
  };

  const logout = () => {
    // Remove auth token and flags
    Cookies.remove("authToken");
    localStorage.removeItem("userIsAuthenticated");
    localStorage.removeItem("auth");

    // Update auth state
    setIsAuthenticated(false);
    setUser(null);

    // Redirect to home page
    router.push("/en/login");
  };

  const refreshUser = async () => {
    await checkAuthStatus();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        register,
        logout,
        refreshUser,
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
