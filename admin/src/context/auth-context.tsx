"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // First check if we have a stored token
      const storedToken = localStorage.getItem("authToken");

      if (storedToken) {
        // Validate the stored token
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/validate-token`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.valid && data.role === "admin") {
            setUser({
              id: data.userId,
              email: "admin",
              name: "Admin User",
              role: data.role,
              balance: 0,
            });
            return;
          }
        }
      }

      // If no valid token, user is not authenticated
      setUser(null);
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting login with:", email);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      console.log("Login response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Login response data:", data);

        // Check if login was successful and get token
        if (
          data.success &&
          data.token &&
          data.user &&
          data.user.role === "admin"
        ) {
          // Store the token for future requests
          localStorage.setItem("authToken", data.token);

          // Set user in context
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name || "Admin User",
            role: data.user.role,
            balance: 0,
          });

          console.log("Admin user authenticated:", data.user);
          return true;
        } else if (data.user && data.user.role !== "admin") {
          throw new Error(
            `Access denied: Your role is '${data.user.role}', admin role required`
          );
        } else {
          throw new Error("Invalid response format or missing admin role");
        }
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Login failed" }));
        console.log("Login error:", errorData);
        throw new Error(errorData.error || `Login failed (${response.status})`);
      }
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Remove stored token
      localStorage.removeItem("authToken");

      // Call logout endpoint if available
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
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
