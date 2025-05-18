// components/admin/users/user-table.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MoreHorizontal,
  Shield,
  Ban,
  Key,
  Mail,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import { AdminUser } from "@/src/types/admin";
import { UserDetailModal } from "./user-detail-modal";
import { UserEditModal } from "./user-edit-modal";
import { fetchWithAuth } from "@/src/utils/auth";

interface UserTableProps {
  users: AdminUser[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onUserUpdate: () => void;
}

export function UserTable({
  users,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  onUserUpdate,
}: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    user: AdminUser;
    action: string;
    open: boolean;
  } | null>(null);

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  const handleAction = async (action: string, user: AdminUser) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_GO_API_URL || "";

      if (action === "delete") {
        const response = await fetchWithAuth(
          `${apiUrl}/api/admin/users/${user.id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) throw new Error("Failed to delete user");

        toast.success("User deleted successfully");
        onUserUpdate();
        setConfirmAction(null);
        return;
      }

      let updates = {};
      switch (action) {
        case "make-admin":
          updates = { role: "admin" };
          break;
        case "remove-admin":
          updates = { role: "user" };
          break;
        case "suspend":
          updates = { role: "suspended" };
          break;
        case "unsuspend":
          updates = { role: "user" };
          break;
        case "reset-free-operations":
          updates = { freeOperationsUsed: 0 };
          break;
        default:
          return;
      }

      const response = await fetchWithAuth(
        `${apiUrl}/api/admin/users/${user.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) throw new Error("Failed to update user");

      toast.success(`User ${action} completed successfully`);
      onUserUpdate();
      setConfirmAction(null);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(`Failed to ${action} user`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Account Status</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.name?.[0] || user.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    user.role === "admin"
                      ? "destructive"
                      : user.role === "suspended"
                      ? "outline"
                      : "secondary"
                  }
                >
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {user.freeOperationsRemaining} / 500
                    </span>
                    <span className="text-xs text-muted-foreground">
                      free ops
                    </span>
                  </div>
                  <div>
                    <Badge variant="outline">
                      {user.subscription?.tier || "free"}
                    </Badge>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {formatCurrency(user.balance || 0)}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatDate(user.lastActive)}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditingUser(user)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setConfirmAction({
                          user,
                          action: "reset-free-operations",
                          open: true,
                        })
                      }
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset Free Ops
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Key className="mr-2 h-4 w-4" />
                      View API Keys
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        setConfirmAction({
                          user,
                          action:
                            user.role === "admin"
                              ? "remove-admin"
                              : "make-admin",
                          open: true,
                        })
                      }
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() =>
                        setConfirmAction({
                          user,
                          action:
                            user.role === "suspended" ? "unsuspend" : "suspend",
                          open: true,
                        })
                      }
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      {user.role === "suspended"
                        ? "Unsuspend User"
                        : "Suspend User"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() =>
                        setConfirmAction({
                          user,
                          action: "delete",
                          open: true,
                        })
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between py-4">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      <UserDetailModal
        user={selectedUser}
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onAction={(action) => {
          if (selectedUser) {
            if (action === "email") {
              window.location.href = `mailto:${selectedUser.email}`;
            } else {
              handleAction(action, selectedUser);
            }
          }
        }}
      />

      {/* User Edit Modal */}
      <UserEditModal
        user={editingUser}
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={onUserUpdate}
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmAction?.open}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {confirmAction?.action.replace("-", " ")}{" "}
              this user?
              {confirmAction?.action === "delete" && (
                <p className="text-destructive mt-2">
                  This action cannot be undone. All user data will be
                  permanently deleted.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              variant={
                confirmAction?.action.includes("suspend") ||
                confirmAction?.action === "delete"
                  ? "destructive"
                  : "default"
              }
              onClick={() => {
                if (confirmAction) {
                  handleAction(confirmAction.action, confirmAction.user);
                }
              }}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
