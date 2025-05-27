"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated after loading completes, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // If authenticated but not an admin, redirect to unauthorized
    if (!isLoading && isAuthenticated && user && user.role !== "admin") {
      router.push("/unauthorized");
      return;
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Show loading state
  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  // If user is authenticated and is an admin, show admin layout
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
