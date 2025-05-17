// src/context/auth-context.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name?: string;
  email: string;
  role?: string;
  isEmailVerified?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  authToken: string | null;
  isWebUI: boolean;
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
  checkAuthStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  authToken: null,
  isWebUI: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  checkAuthStatus: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if we're in the browser and not in an API context
  const isWebUI = typeof window !== "undefined";

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Check for token in localStorage or sessionStorage
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setAuthToken(null);
        setIsLoading(false);
        return false;
      }

      // Get user data from local storage
      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setAuthToken(token);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      }

      // If no user data in local storage but token exists, fetch user profile
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_GO_API_URL}/api/user/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem("userData", JSON.stringify(userData));
          setAuthToken(token);
          setIsAuthenticated(true);
          setIsLoading(false);
          return true;
        } else {
          // Token is invalid or expired
          localStorage.removeItem("authToken");
          sessionStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          setIsAuthenticated(false);
          setUser(null);
          setAuthToken(null);
          setIsLoading(false);
          return false;
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsAuthenticated(false);
        setUser(null);
        setAuthToken(null);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
      setUser(null);
      setAuthToken(null);
      setIsLoading(false);
      return false;
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
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

      if (!response.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      if (!data.success || !data.token) {
        return { success: false, error: data.error || "Login failed" };
      }

      // Store the token
      localStorage.setItem("authToken", data.token);

      // Store user data
      if (data.user) {
        localStorage.setItem("userData", JSON.stringify(data.user));
        setUser(data.user);
      }

      setAuthToken(data.token);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
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
        return { success: false, error: data.error || "Registration failed" };
      }

      if (!data.success) {
        return { success: false, error: data.error || "Registration failed" };
      }

      // If token is provided, store it
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        setAuthToken(data.token);

        // Store user data if provided
        if (data.user) {
          localStorage.setItem("userData", JSON.stringify(data.user));
          setUser(data.user);
          setIsAuthenticated(true);
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setIsAuthenticated(false);
    setUser(null);
    setAuthToken(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        authToken,
        isWebUI,
        login,
        register,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
