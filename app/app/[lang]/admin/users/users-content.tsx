// app/[lang]/admin/users/users-content.tsx
"use client";

import { useEffect, useState } from "react";
import { UserTable } from "@/components/admin/users/user-table";
import { UserFilters } from "@/components/admin/users/user-filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { AdminUser } from "@/src/types/admin";
import { UserDetailModal } from "@/components/admin/users/user-detail-modal";
import { fetchWithAuth } from "@/src/utils/auth";

export function AdminUsersContent() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    tier: "all",
    status: "all",
    role: "all",
  });
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page, search, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        search,
        ...filters,
      });

      const apiUrl = process.env.NEXT_PUBLIC_GO_API_URL || "";
      const response = await fetchWithAuth(
        `${apiUrl}/api/admin/users?${params}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setTotalUsers(data.total);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };
  const handleUserAction = async (action: string) => {
    if (action === "email" && selectedUser) {
      window.location.href = `mailto:${selectedUser.email}`;
      return;
    }

    // Handle other actions through the API
    if (selectedUser) {
      try {
        const updates: any = {};
        if (action === "make-admin") updates.role = "admin";
        if (action === "remove-admin") updates.role = "user";
        if (action === "suspend") updates.role = "suspended";
        if (action === "unsuspend") updates.role = "user";
        if (action === "reset-free-operations") updates.freeOperationsUsed = 0;

        // Use the Go API URL from environment variables
        const apiUrl = process.env.NEXT_PUBLIC_GO_API_URL || "";

        const response = await fetch(
          `${apiUrl}/api/admin/users/${selectedUser.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Include cookies for authentication
            body: JSON.stringify({ updates }),
          }
        );

        if (!response.ok)
          throw new Error(`Failed to update user: ${response.status}`);

        toast.success(
          `User ${action.replace("-", " ")} completed successfully`
        );
        fetchUsers();
        setSelectedUser(null);
      } catch (error) {
        console.error("Error updating user:", error);
        toast.error(`Failed to ${action.replace("-", " ")} user`);
      }
    }
  };

  const exportUsers = async () => {
    try {
      // Use the Go API URL from environment variables
      const apiUrl = process.env.NEXT_PUBLIC_GO_API_URL || "";

      // Add any filter parameters if needed
      const params = new URLSearchParams({
        format: "csv",
        ...filters, // Include any active filters
      });

      const response = await fetch(
        `${apiUrl}/api/admin/users/export?${params}`,
        {
          credentials: "include", // Include cookies for authentication
        }
      );

      if (!response.ok)
        throw new Error(`Failed to export users: ${response.status}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Users exported successfully");
    } catch (error) {
      console.error("Error exporting users:", error);
      toast.error("Failed to export users");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions ({totalUsers} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportUsers}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* User Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                users.filter(
                  (u) => u.subscription && u.subscription.tier !== "free"
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "admin").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                users.filter((u) => {
                  if (!u.lastActive) return false;
                  const lastActive = new Date(u.lastActive);
                  const today = new Date();
                  return lastActive.toDateString() === today.toDateString();
                }).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <UserFilters
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>

            <UserTable
              users={users}
              loading={loading}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              onUserUpdate={fetchUsers}
            />
          </div>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onAction={handleUserAction}
      />
    </div>
  );
}
