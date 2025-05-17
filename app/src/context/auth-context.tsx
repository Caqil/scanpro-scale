"use client";

import { useRouter } from "next/navigation";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
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
  refreshAuth: () => Promise<void>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const router = useRouter();

  // Initialize auth state from storage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a token in storage
        const token =
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("authToken");

        if (!token) {
          setState({ ...initialState, loading: false });
          return;
        }

        // Validate token with the API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_GO_API_URL}/api/auth/validate-token`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          // Token is invalid, clear it
          localStorage.removeItem("authToken");
          sessionStorage.removeItem("authToken");
          setState({ ...initialState, loading: false });
          return;
        }

        // Token is valid, fetch user profile
        const userResponse = await fetch(
          `${process.env.NEXT_PUBLIC_GO_API_URL}/api/user/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!userResponse.ok) {
          setState({ ...initialState, loading: false });
          return;
        }

        const userData = await userResponse.json();

        setState({
          isAuthenticated: true,
          user: userData,
          token,
          loading: false,
        });
      } catch (error) {
        console.error("Auth initialization error:", error);
        setState({ ...initialState, loading: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_GO_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();
      console.log("Setting token:", data.token);
      document.cookie = `authToken=${data.token}; path=/; max-age=604800; SameSite=Lax`;
      console.log("Cookies after login:", document.cookie);
      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Invalid email or password",
        };
      }

      // Save token to storage (localStorage for "remember me", sessionStorage otherwise)
      const rememberMe = localStorage.getItem("rememberMe") === "true";
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("authToken", data.token);

      // Get user profile
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_GO_API_URL}/api/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        }
      );

      const userData = await userResponse.json();

      setState({
        isAuthenticated: true,
        user: userData,
        token: data.token,
        loading: false,
      });

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Registration failed",
        };
      }

      // If registration auto-logs in with a token
      if (data.token) {
        localStorage.setItem("authToken", data.token);

        setState({
          isAuthenticated: true,
          user: data.user,
          token: data.token,
          loading: false,
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
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
    // Clear token from storage
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");

    // Reset auth state
    setState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
    });

    // Redirect to login page
    router.push("/en/login");
  };

  const refreshAuth = async () => {
    // Similar to initializeAuth but can be called manually to refresh user data
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      if (!token) {
        setState({ ...initialState, loading: false });
        return;
      }

      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_GO_API_URL}/api/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!userResponse.ok) {
        // If profile fetch fails, token might be invalid
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
        setState({ ...initialState, loading: false });
        return;
      }

      const userData = await userResponse.json();

      setState({
        isAuthenticated: true,
        user: userData,
        token,
        loading: false,
      });
    } catch (error) {
      console.error("Error refreshing auth:", error);
      setState({ ...initialState, loading: false });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshAuth,
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
