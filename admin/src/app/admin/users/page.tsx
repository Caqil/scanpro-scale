"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/auth";
import { Users, Search } from "lucide-react";

interface User {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  balance: number;
  createdAt: string;
  lastActive?: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error("Failed to fetch users");
        setUsers([]); // Fallback to empty array
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(search.toLowerCase()))
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions ({users.length} total)
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Users</h3>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{users.length}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Admin Users</h3>
            <Users className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold">
            {users.filter((u) => u.role === "admin").length}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Regular Users</h3>
            <Users className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">
            {users.filter((u) => u.role === "user").length}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Balance</h3>
            <Users className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold">
            ${users.reduce((sum, u) => sum + (u.balance || 0), 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-medium">All Users</h3>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">User</th>
                    <th className="text-left py-2">Role</th>
                    <th className="text-left py-2">Balance</th>
                    <th className="text-left py-2">Created</th>
                    <th className="text-left py-2">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border">
                      <td className="py-3">
                        <div>
                          <p className="font-medium">
                            {user.name || "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === "admin"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="font-medium">
                          ${user.balance.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>
                      {/* <td className="py-3 text-sm text-muted-foreground">
                        {formatDate(user.lastActive)}
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
