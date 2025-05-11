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
import { Ban, CheckCircle, Key, Shield, Mail } from "lucide-react";
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                  {user.subscription && (
                    <Badge variant="outline">{user.subscription.tier}</Badge>
                  )}
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
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
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

            <TabsContent value="subscription" className="space-y-4">
              {user.subscription ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Plan</p>
                        <Badge>{user.subscription.tier}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <Badge
                          variant={
                            user.subscription.status === "active"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {user.subscription.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Current Period End
                        </p>
                        <p className="text-sm">
                          {formatDate(user.subscription.currentPeriodEnd)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          PayPal Subscription ID
                        </p>
                        <p className="text-sm font-mono">
                          {user.subscription.paypalSubscriptionId || "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-6 text-center text-muted-foreground">
                    User has no active subscription
                  </CardContent>
                </Card>
              )}
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
