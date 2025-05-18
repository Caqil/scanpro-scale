"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { DollarSign, CreditCard, DownloadCloud, Upload } from "lucide-react";
import { useLanguageStore } from "@/src/store/store";
import { useAuth } from "@/src/context/auth-context";

export function BalancePanel() {
  const { t } = useLanguageStore();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [balance, setBalance] = useState(0);
  const [freeOpsUsed, setFreeOpsUsed] = useState(0);
  const [freeOpsTotal, setFreeOpsTotal] = useState(500);
  const [freeOpsRemaining, setFreeOpsRemaining] = useState(0);
  const [resetDate, setResetDate] = useState<Date | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [depositAmount, setDepositAmount] = useState("10");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get API URL from environment variable
  const apiUrl = process.env.NEXT_PUBLIC_GO_API_URL || "";

  // Fetch balance information
  const fetchBalance = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Use API URL from environment variables
      const response = await fetch(`${apiUrl}/api/user/balance`, {
        method: "GET",
        credentials: "include", // Include cookies for auth
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch balance information");
      }

      const data = await response.json();

      setBalance(data.balance || 0);
      setFreeOpsUsed(data.freeOperationsUsed || 0);
      setFreeOpsTotal(data.freeOperationsTotal || 500);
      setFreeOpsRemaining(data.freeOperationsRemaining || 0);
      setResetDate(data.nextResetDate ? new Date(data.nextResetDate) : null);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast.error(
        t("balancePanel.errors.balanceFetchFailed") ||
          "Could not load balance information"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchBalance();
    }
  }, [authLoading, isAuthenticated]);

  // Handle deposit
  const handleDeposit = async () => {
    if (!isAuthenticated) {
      toast.error(
        t("balancePanel.errors.notAuthenticated") ||
          "Please sign in to deposit funds"
      );
      return;
    }

    try {
      setIsProcessing(true);

      const amount = parseFloat(depositAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error(
          t("balancePanel.errors.invalidAmount") || "Invalid deposit amount"
        );
        return;
      }

      if (amount < 5) {
        toast.error(
          t("balancePanel.errors.minimumDeposit") || "Minimum deposit is $5"
        );
        return;
      }

      const response = await fetch(`${apiUrl}/api/user/deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for auth
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error ||
            t("balancePanel.errors.depositFailed") ||
            "Deposit failed"
        );
      }

      const data = await response.json();

      if (data.checkoutUrl) {
        // Redirect to PayPal
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Deposit error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("balancePanel.errors.depositFailed") || "Deposit failed"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate free operations progress percentage
  const freeOpsPercentage = Math.min(
    Math.round((freeOpsUsed / freeOpsTotal) * 100),
    100
  );

  if (authLoading) {
    return <div>{t("balancePanel.status.loading") || "Loading..."}</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        {t("balancePanel.status.pleaseSignIn") ||
          "Please sign in to view your balance"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Current Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("balancePanel.title.currentBalance") || "Current Balance"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isLoading ? "..." : balance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("balancePanel.description.operationCost") ||
                "$0.005 per operation"}
            </p>
          </CardContent>
          <CardFooter className="p-4">
            <Button
              onClick={() => document.getElementById("deposit-tab")?.click()}
              variant="outline"
              className="w-full"
            >
              {t("balancePanel.button.addFunds") || "Add Funds"}
            </Button>
          </CardFooter>
        </Card>

        {/* Free Operations Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("balancePanel.title.freeOperations") || "Free Operations"}
            </CardTitle>
            <DownloadCloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : freeOpsRemaining} / {freeOpsTotal}
            </div>
            <div className="mt-2">
              <Progress value={freeOpsPercentage} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isLoading || !resetDate
                ? "..."
                : t("balancePanel.description.resetsOn").replace(
                    "{date}",
                    formatDate(resetDate.toISOString())
                  )}
            </p>
          </CardContent>
        </Card>

        {/* Operations Coverage Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("balancePanel.title.operationsCoverage") ||
                "Operations Coverage"}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : Math.floor(balance / 0.005)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("balancePanel.description.operationsWithBalance") ||
                "Operations with current balance"}
            </p>
          </CardContent>
          <CardFooter className="p-4">
            <Button
              onClick={() => document.getElementById("deposit-tab")?.click()}
              variant="outline"
              className="w-full"
            >
              {t("balancePanel.button.addFunds") || "Add Funds"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">
            {t("balancePanel.tabs.transactions") || "Transactions"}
          </TabsTrigger>
          <TabsTrigger value="deposit" id="deposit-tab">
            {t("balancePanel.tabs.deposit") || "Deposit"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("balancePanel.title.transactionHistory") ||
                  "Transaction History"}
              </CardTitle>
              <CardDescription>
                {t("balancePanel.description.transactionDescription") ||
                  "Your recent account transactions"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">
                  {t("balancePanel.status.loading") || "Loading..."}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  {t("balancePanel.status.noTransactions") ||
                    "No transactions found"}
                </div>
              ) : (
                <Table>
                  <TableCaption>
                    {t("balancePanel.table.recentTransactions") ||
                      "Recent transactions"}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("balancePanel.table.date") || "Date"}
                      </TableHead>
                      <TableHead>
                        {t("balancePanel.table.description") || "Description"}
                      </TableHead>
                      <TableHead>
                        {t("balancePanel.table.amount") || "Amount"}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("balancePanel.table.balance") || "Balance"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{formatDate(tx.createdAt)}</TableCell>
                        <TableCell>
                          <span
                            className={
                              tx.status === "pending"
                                ? "text-yellow-500"
                                : tx.status === "failed"
                                ? "text-red-500"
                                : ""
                            }
                          >
                            {tx.description}
                            {tx.status === "pending" &&
                              ` ${
                                t("balancePanel.table.pending") || "(Pending)"
                              }`}
                            {tx.status === "failed" &&
                              ` ${
                                t("balancePanel.table.failed") || "(Failed)"
                              }`}
                          </span>
                        </TableCell>
                        <TableCell
                          className={
                            tx.amount >= 0 ? "text-green-600" : "text-red-600"
                          }
                        >
                          {tx.amount >= 0 ? "+" : ""}
                          {tx.amount.toFixed(3)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${tx.balanceAfter.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposit">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("balancePanel.title.depositFunds") || "Deposit Funds"}
              </CardTitle>
              <CardDescription>
                {t("balancePanel.description.depositDescription") ||
                  "Add funds to your account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    {t("balancePanel.form.depositAmount") || "Deposit Amount"}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      min="5"
                      step="5"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder={
                        t("balancePanel.form.enterAmount") || "Enter amount"
                      }
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 20, 50].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      onClick={() => setDepositAmount(amount.toString())}
                      disabled={isProcessing}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>

                <div className="bg-muted p-3 rounded-md text-sm">
                  <p>
                    <strong>{t("balancePanel.form.operationsCoverage")}</strong>{" "}
                    {t(
                      "balancePanel.description.operationsCoverageInfo"
                    ).replace(
                      "{count}",
                      Math.floor(
                        parseFloat(depositAmount || "0") / 0.005
                      ).toString()
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("balancePanel.description.operationCostInfo") ||
                      "$0.005 per operation"}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleDeposit}
                disabled={isProcessing || !isAuthenticated}
              >
                {isProcessing ? (
                  <>{t("balancePanel.button.processing") || "Processing..."}</>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {t("balancePanel.button.deposit") || "Deposit"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
