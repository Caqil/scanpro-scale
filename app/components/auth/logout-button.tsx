"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton({ variant = "ghost" }: { variant?: "ghost" | "default" }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      // The key here is to use the redirect: false option and handle the redirection manually
      await signOut({ redirect: true });
      router.push("/en");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      className="w-full justify-start text-muted-foreground hover:text-foreground"
      onClick={handleSignOut}
      disabled={isLoggingOut}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isLoggingOut ? "Signing out..." : "Sign out"}
    </Button>
  );
}