"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_GO_API_URL || "";

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`${apiUrl}/api/validate-token`, {
          credentials: "include", // Send HTTP-only cookie
        });

        if (!response.ok) {
          setIsAuthenticated(false);
          setUser(null);
          return;
        }

        const data = await response.json();

        if (data.valid) {
          setUser({
            id: data.userId,
            role: data.role,
            name: null, // Will be populated by refreshUserData if needed
            email: null,
            isEmailVerified: false,
          });
          setIsAuthenticated(true);
          await refreshUserData(); // Fetch full profile asynchronously
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("checkAuth - Error:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [apiUrl]);

  // Refresh user data (fetch full profile)
  const refreshUserData = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/user/profile`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const userData: User = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("refreshUserData - Error:", error);
      // Don't clear auth state; token may still be valid
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Receive HTTP-only cookie
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || "Login failed" };
      }

      const data = await response.json();

      if (data.success) {
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          isEmailVerified: data.user.isEmailVerified,
        });
        setIsAuthenticated(true);

        const urlParams = new URLSearchParams(window.location.search);
        const callbackUrl = urlParams.get("callbackUrl") || "/en/dashboard";
        router.push(callbackUrl);

        return { success: true };
      }

      return { success: false, error: "Login failed" };
    } catch (error) {
      console.error("login - Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }

      if (data.success) {
        // Optionally auto-login after registration
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: "user", // Default role, adjust as needed
          isEmailVerified: data.user.isEmailVerified,
        });
        setIsAuthenticated(true);
        router.push("/en/dashboard");
        return { success: true };
      }

      return { success: false, error: "Registration failed" };
    } catch (error) {
      console.error("register - Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Registration failed",
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("logout - Error:", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      router.push("/login");
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
