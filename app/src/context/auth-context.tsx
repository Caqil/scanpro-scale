// src/context/auth-context.tsx
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  fetchWithAuth,
  getAuthToken,
  removeAuthToken,
  setAuthToken,
} from "../utils/auth";

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
        const token = getAuthToken();

        console.log(
          "checkAuth - Token:",
          token ? "Found" : "Not found",
          "Cookies:",
          document.cookie
        );

        if (!token) {
          console.log("checkAuth - No token, setting unauthenticated");
          setIsAuthenticated(false);
          setUser(null);
          return;
        }

        const response = await fetchWithAuth(`${apiUrl}/api/validate-token`);

        console.log(
          "checkAuth - Validate token status:",
          response.status,
          "Response:",
          await response.text()
        );

        if (!response.ok) {
          console.error(
            "checkAuth - Token validation failed:",
            response.status,
            await response.text()
          );
          setIsAuthenticated(false);
          setUser(null);
          removeAuthToken();
          return;
        }

        const data = await response.json();

        if (data.valid) {
          console.log("checkAuth - Token valid, fetching profile");
          const userResponse = await fetchWithAuth(
            `${apiUrl}/api/user/profile`
          );
          console.log(
            "checkAuth - Profile fetch status:",
            userResponse.status,
            "Response:",
            await userResponse.text()
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData);
            setIsAuthenticated(true); // Move this after successful profile fetch
          } else {
            console.error(
              "checkAuth - Profile fetch failed:",
              userResponse.status,
              await userResponse.text()
            );
            setIsAuthenticated(false);
            setUser(null);
            removeAuthToken();
          }
        } else {
          console.log("checkAuth - Token invalid");
          setIsAuthenticated(false);
          setUser(null);
          removeAuthToken();
        }
      } catch (error) {
        console.error("checkAuth - Error:", error);
        setIsAuthenticated(false);
        setUser(null);
        removeAuthToken();
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
  // src/context/auth-context.tsx
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      console.log("login - Status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("login - Error:", errorData);
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();

      console.log("login - Response data:", data);

      if (data.token) {
        setAuthToken(data.token);
        setIsAuthenticated(true);
        setUser(data.user);

        const urlParams = new URLSearchParams(window.location.search);
        const callbackUrl = urlParams.get("callbackUrl") || "/en/dashboard";
        router.push(callbackUrl);

        return { success: true };
      } else {
        throw new Error("No token received");
      }
    } catch (error) {
      console.error("login - Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  // Update logout method
  const logout = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_GO_API_URL || "";
      await fetchWithAuth(`${apiUrl}/api/auth/logout`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clean up state
      setIsAuthenticated(false);
      setUser(null);
      removeAuthToken();
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
