"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/src/context/auth-context";
import { apiRequest } from "@/src/utils/api";

export function UserProfile() {
  // Change from refreshAuth to refreshUserData (which exists in your auth context)
  const { user, refreshUserData } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiRequest("/api/user/profile", {
        method: "PUT",
        body: JSON.stringify({ name }),
      });

      toast.success("Profile updated successfully");
      refreshUserData(); // Use refreshUserData instead of refreshAuth
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          // Ensure value is always a string, fixing the type error
          value={user?.email || ""}
          disabled
          placeholder="Your email"
        />
        <p className="text-sm text-muted-foreground">
          Your email address cannot be changed
        </p>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
