"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  isEmailVerified: boolean;
  balance?: number;
  freeOperationsUsed?: number;
  freeOperationsRemaining?: number;
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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        console.log("Checking auth status...");

        const response = await fetch(`${apiUrl}/api/validate-token`, {
          credentials: "include", // Send HTTP-only cookie
          headers: {
            "Cache-Control": "no-cache", // Prevent caching issues
          },
        });

        if (!response.ok) {
          console.log("Auth check failed:", response.status);
          setIsAuthenticated(false);
          setUser(null);
          return;
        }

        const data = await response.json();
        console.log("Auth check response:", data);

        if (data.valid) {
          setUser({
            id: data.userId,
            role: data.role,
            name: null, // Will be populated by refreshUserData
            email: null,
            isEmailVerified: false,
          });
          setIsAuthenticated(true);

          // Fetch full profile asynchronously
          try {
            await refreshUserData();
          } catch (profileError) {
            console.error("Failed to load complete profile:", profileError);
            // Don't log out - keep basic auth info
          }
        } else {
          console.log("Auth token invalid");
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

    checkAuth();
  }, [apiUrl]);

  // Refresh user data (fetch full profile)
  const refreshUserData = async () => {
    try {
      console.log("Refreshing user data...");
      const response = await fetch(`${apiUrl}/api/user/profile`, {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch user profile:", response.status);
        throw new Error("Failed to fetch user profile");
      }

      const userData = await response.json();
      console.log("User profile loaded:", userData);

      // Update user state with full profile data
      setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isEmailVerified: userData.isEmailVerified,
        balance: userData.balance,
        freeOperationsUsed: userData.freeOperationsUsed,
        freeOperationsRemaining: userData.freeOperationsRemaining,
        freeOperationsReset: userData.freeOperationsReset,
      });

      return userData;
    } catch (error) {
      console.error("refreshUserData - Error:", error);
      // Don't clear auth state; token may still be valid
      throw error;
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
        // Set user with data from login response
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          isEmailVerified: data.user.isEmailVerified,
        });
        setIsAuthenticated(true);

        // Try to fetch full profile data to get additional fields
        try {
          await refreshUserData();
        } catch (profileError) {
          console.error(
            "Failed to load complete profile after login:",
            profileError
          );
          // Continue with basic user data
        }

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
        // Set user with data from register response
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: "user", // Default role
          isEmailVerified: data.user.isEmailVerified,
        });
        setIsAuthenticated(true);

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
      const response = await fetch(`${apiUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Logged out successfully");
      }
    } catch (error) {
      console.error("logout - Error:", error);
    } finally {
      // Always clear local state even if API call fails
      setIsAuthenticated(false);
      setUser(null);
      router.push("/en/login");
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
