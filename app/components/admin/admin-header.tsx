"use client";

import { useState } from "react";
import { Bell, Search, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/src/context/auth-context";
import { LanguageLink } from "@/components/language-link";
import { LogoutButton } from "@/components/auth/logout-button";

export function AdminHeader() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (isLoading) {
    return (
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users, operations..."
              className="pl-10"
              disabled
            />
          </div>
        </div>
        <Button variant="ghost" size="sm" disabled>
          Loading...
        </Button>
      </header>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // AdminHeader should not render if not authenticated
  }

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users, operations..." className="pl-10" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  );
}
