// src/context/auth-context.tsx
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  isEmailVerified: boolean;
  balance?: number;
  freeOperationsUsed?: number;
  freeOperationsReset?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
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
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_GO_API_URL || "";

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);

        // Check for auth cookie
        const hasAuthCookie = document.cookie.includes("authToken=");

        if (!hasAuthCookie) {
          setIsAuthenticated(false);
          setUser(null);
          return;
        }

        // Verify token with API
        const response = await fetch(`${apiUrl}/api/validate-token`, {
          credentials: "include", // Important: include cookies in the request
        });

        if (!response.ok) {
          throw new Error("Invalid token");
        }

        const data = await response.json();

        if (data.valid) {
          setIsAuthenticated(true);
          // Fetch user data
          await refreshUserData();
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [apiUrl]);

  const refreshUserData = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/user/profile`, {
        credentials: "include", // Include cookies
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      // Don't clear auth state here - the token might still be valid
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
       // credentials: "include", // Important: include cookies in the response
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      if (data.success) {
        // The cookie should be set by the server, but we can also store in localStorage as backup
        localStorage.setItem("userIsAuthenticated", "true");
        // Store basic user info
        if (data.user) {
          localStorage.setItem("userData", JSON.stringify(data.user));
        }

        setIsAuthenticated(true);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }

      if (data.success) {
        // Could automatically log in the user here if desired
        return { success: true };
      } else {
        return { success: false, error: data.error || "Registration failed" };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem("userIsAuthenticated");
      localStorage.removeItem("userData");

      // Clear cookie
      Cookies.remove("authToken");

      // Call logout endpoint (if available)
      try {
        await fetch(`${apiUrl}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.error("Logout API call failed:", error);
      }

      // Update state
      setIsAuthenticated(false);
      setUser(null);

      // Redirect to login
      router.push("/en/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
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
        refreshUserData,
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
