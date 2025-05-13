// components/admin/users/user-detail-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import {
  Ban,
  CheckCircle,
  Key,
  Shield,
  Mail,
  Eye,
  UserX,
  Edit2,
  Plus,
  Minus,
} from "lucide-react";
import { AdminUser } from "@/src/types/admin";

interface UserDetailModalProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
}

export function UserDetailModal({
  user,
  open,
  onClose,
  onAction,
}: UserDetailModalProps) {
  if (!user) return null;

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateRelative = (date: Date | null) => {
    if (!date) return "Never";
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-8xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {user.name?.[0] || user.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">
                  {user.name || "Unknown"}
                </h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex gap-2 mt-1">
                  <Badge
                    variant={
                      user.role === "admin" ? "destructive" : "secondary"
                    }
                  >
                    {user.role}
                  </Badge>
                  <Badge variant="outline">
                    {user.subscription?.tier || "free"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction("email")}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onAction(
                    user.role === "admin" ? "remove-admin" : "make-admin"
                  )
                }
              >
                <Shield className="mr-2 h-4 w-4" />
                {user.role === "admin" ? "Remove Admin" : "Make Admin"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onAction("suspend")}
              >
                <Ban className="mr-2 h-4 w-4" />
                Suspend
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="balance">Balance</TabsTrigger>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Account Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">User ID</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {user.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Active</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateRelative(user.lastActive)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Usage Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">This Month</p>
                      <p className="text-2xl font-bold">
                        {user.usage.thisMonth}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Month</p>
                      <p className="text-sm text-muted-foreground">
                        {user.usage.lastMonth}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Operations</p>
                      <p className="text-sm text-muted-foreground">
                        {user.usage.total}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="balance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Balance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Current Balance</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(user.balance || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Free Operations</p>
                      <div className="flex gap-2 items-center">
                        <p className="text-lg font-semibold">
                          {user.freeOperationsRemaining || 0}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          remaining this month
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Account Tier</p>
                      <Badge>{user.subscription?.tier || "free"}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Operations This Month
                      </p>
                      <p className="text-lg font-semibold">
                        {user.usage.thisMonth}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAction("add-balance")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Balance
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAction("subtract-balance")}
                    >
                      <Minus className="mr-2 h-4 w-4" />
                      Subtract Balance
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAction("reset-free-operations")}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Reset Free Operations
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-4 text-muted-foreground">
                    Transaction history will appear here. Currently, you need to
                    implement fetching transaction records for this user.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api-keys" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Keys ({user.apiKeys.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {user.apiKeys.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Permissions</TableHead>
                          <TableHead>Last Used</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {user.apiKeys.map((key) => (
                          <TableRow key={key.id}>
                            <TableCell className="font-medium">
                              {key.name}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {key.permissions.slice(0, 3).map((perm) => (
                                  <Badge
                                    key={perm}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {perm}
                                  </Badge>
                                ))}
                                {key.permissions.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{key.permissions.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatDateRelative(key.lastUsed)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No API keys created
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-4">
                    Activity log functionality coming soon
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
