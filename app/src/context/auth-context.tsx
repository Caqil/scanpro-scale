"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

// Define types for the authentication context
type AuthContextType = {
    isAuthenticated: boolean;
    isLoading: boolean;
    authToken: string | null;
    userId: string | null;
    isWebUI: boolean;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    isLoading: true,
    authToken: null,
    userId: null,
    isWebUI: true,
});

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [authToken, setAuthToken] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user) {
            setAuthToken('session-token'); // Replace with real token logic if needed
        } else {
            setAuthToken(null);
        }
    }, [session]);

    const value: AuthContextType = {
        isAuthenticated: !!session?.user,
        isLoading: status === 'loading',
        authToken,
        userId: session?.user?.id || null,
        isWebUI: true,
    };

    return <AuthContext.Provider value={ value }> { children } </AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}