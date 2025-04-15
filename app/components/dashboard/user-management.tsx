"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Users,
  User,
  Search,
  MoreVertical,
  Shield,
  Key,
  Ban,
  Mail,
  UserPlus,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: Date;
  role: string;
  subscription?: {
    tier: string;
    status: string;
  } | null;
}

interface UserManagementProps {
  initialUsers: UserData[];
  totalUsers: number;
}

export function UserManagement({ initialUsers, totalUsers }: UserManagementProps) {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 25;
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  // New user form states
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    subscriptionTier: "free"
  });

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    // Filter by search query
    if (
      searchQuery &&
      !user.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Filter by role
    if (selectedRole && user.role !== selectedRole) {
      return false;
    }

    // Filter by subscription status
    if (selectedStatus && user.subscription?.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRole(null);
    setSelectedStatus(null);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle user role change
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setIsLoading(true);
      // In a real implementation, you would call your API here
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      toast.success("User role updated successfully");
    } catch (error) {
      toast.error("Failed to update user role");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle subscription change
  const handleSubscriptionChange = async (userId: string, tier: string) => {
    try {
      setIsLoading(true);
      // In a real implementation, you would call your API here
      const response = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user subscription");
      }

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                subscription: {
                  ...user.subscription,
                  tier,
                } as any,
              }
            : user
        )
      );

      toast.success("User subscription updated successfully");
    } catch (error) {
      toast.error("Failed to update user subscription");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle add new user
  const handleAddUser = async () => {
    try {
      setIsLoading(true);
      
      // Validate form
      if (!newUserData.name || !newUserData.email || !newUserData.password) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      // In a real implementation, you would call your API here
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserData),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      // Get the created user and update local state
      const createdUser = await response.json();
      setUsers([createdUser, ...users]);
      
      // Reset form and close dialog
      setNewUserData({
        name: "",
        email: "",
        password: "",
        role: "user",
        subscriptionTier: "free"
      });
      setIsAddUserDialogOpen(false);
      
      toast.success("User created successfully");
    } catch (error) {
      toast.error("Failed to create user");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock user action (delete, disable, etc.)
  const handleUserAction = async (userId: string, action: string) => {
    // In a real implementation, you would call your API here
    toast.success(`${action} action triggered for user ${userId}`);
  };

  // Load users for a specific page
  const loadPage = async (page: number) => {
    try {
      setIsLoading(true);
      // In a real implementation, you would call your API here
      const response = await fetch(`/api/admin/users?page=${page}&limit=${usersPerPage}`);
      
      if (!response.ok) {
        throw new Error("Failed to load users");
      }
      
      const data = await response.json();
      setUsers(data.users);
      setCurrentPage(page);
    } catch (error) {
      toast.error("Failed to load users");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage all user accounts
              </CardDescription>
            </div>
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account. All fields are required.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newUserData.name}
                      onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUserData.password}
                      onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Role
                    </Label>
                    <Select
                      value={newUserData.role}
                      onValueChange={(value) => setNewUserData({ ...newUserData, role: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="subscription" className="text-right">
                      Subscription
                    </Label>
                    <Select
                      value={newUserData.subscriptionTier}
                      onValueChange={(value) => setNewUserData({ ...newUserData, subscriptionTier: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select subscription" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser} disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create User"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and search */}
          <div className="mb-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users by name or email..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedRole || ""} onValueChange={(value) => setSelectedRole(value || null)}>
                  <SelectTrigger className="w-[130px]">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <SelectValue placeholder="Role" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus || ""} onValueChange={(value) => setSelectedStatus(value || null)}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      <SelectValue placeholder="Subscription Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={resetFilters}>
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Users table */}
          {filteredUsers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name / Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="h-[80px]">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name || "Unnamed User"}</span>
                          <span className="text-sm text-muted-foreground">{user.email || "No email"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === "admin" ? "default" : "outline"}
                          className="capitalize"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <Badge
                            variant={
                              user.subscription?.tier === "enterprise"
                                ? "default"
                                : user.subscription?.tier === "pro"
                                ? "default"
                                : "outline"
                            }
                            className="capitalize"
                          >
                            {user.subscription?.tier || "free"}
                          </Badge>
                          {user.subscription?.status && user.subscription.status !== "active" && (
                            <Badge variant="destructive" className="capitalize ml-1">
                              {user.subscription.status}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleUserAction(user.id, "view")}
                            >
                              <User className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUserAction(user.id, "email")}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(
                                user.id, 
                                user.role === "admin" ? "user" : "admin"
                              )}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleUserAction(user.id, "disable")}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Disable Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {searchQuery || selectedRole || selectedStatus
                  ? "No users match the current filter criteria."
                  : "No users have been created yet."}
              </p>
              {(searchQuery || selectedRole || selectedStatus) && (
                <Button onClick={resetFilters}>Clear Filters</Button>
              )}
            </div>
          )}
        </CardContent>
        {filteredUsers.length > 0 && totalPages > 1 && (
          <CardFooter className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPage(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPage(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}