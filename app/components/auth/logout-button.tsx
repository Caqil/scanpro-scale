import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/src/context/auth-context";

export function LogoutButton({
  variant = "ghost",
}: {
  variant?: "ghost" | "default";
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
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
