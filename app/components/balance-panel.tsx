// components/balance-panel.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  TableRow 
} from "@/components/ui/table";
import { toast } from "sonner";
import { DollarSign, CreditCard, DownloadCloud, Upload } from "lucide-react";

export function BalancePanel() {
  const { data: session } = useSession();
  const [balance, setBalance] = useState(0);
  const [freeOpsUsed, setFreeOpsUsed] = useState(0);
  const [freeOpsTotal, setFreeOpsTotal] = useState(500);
  const [freeOpsRemaining, setFreeOpsRemaining] = useState(0);
  const [resetDate, setResetDate] = useState<Date | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [depositAmount, setDepositAmount] = useState('10');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch balance information
  const fetchBalance = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/balance');
      
      if (!response.ok) {
        throw new Error('Failed to fetch balance information');
      }
      
      const data = await response.json();
      
      setBalance(data.balance);
      setFreeOpsUsed(data.freeOperationsUsed);
      setFreeOpsTotal(data.freeOperationsTotal);
      setFreeOpsRemaining(data.freeOperationsRemaining);
      setResetDate(new Date(data.nextResetDate));
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Could not load balance information');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchBalance();
    }
  }, [session]);

  // Handle deposit
  const handleDeposit = async () => {
    try {
      setIsProcessing(true);
      
      const amount = parseFloat(depositAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }
      
      if (amount < 5) {
        toast.error('Minimum deposit amount is $5.00');
        return;
      }
      
      const response = await fetch('/api/user/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process deposit');
      }
      
      const data = await response.json();
      
      if (data.checkoutUrl) {
        // Redirect to PayPal
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Deposit error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process deposit');
    } finally {
      setIsProcessing(false);
    }
  };

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate free operations progress percentage
  const freeOpsPercentage = Math.min(
    Math.round((freeOpsUsed / freeOpsTotal) * 100), 
    100
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Current Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${isLoading ? '...' : balance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Operations cost $0.005 each
            </p>
          </CardContent>
          <CardFooter className="p-4">
            <Button 
              onClick={() => document.getElementById('deposit-tab')?.click()} 
              variant="outline" 
              className="w-full"
            >
              Add Funds
            </Button>
          </CardFooter>
        </Card>

        {/* Free Operations Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Operations</CardTitle>
            <DownloadCloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : freeOpsRemaining} / {freeOpsTotal}</div>
            <div className="mt-2">
              <Progress value={freeOpsPercentage} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Resets on {isLoading || !resetDate ? '...' : formatDate(resetDate.toISOString())}
            </p>
          </CardContent>
        </Card>

        {/* Operations Coverage Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operations Coverage</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : Math.floor(balance / 0.005)}</div>
            <p className="text-xs text-muted-foreground">
              Operations available with current balance
            </p>
          </CardContent>
          <CardFooter className="p-4">
            <Button 
              onClick={() => document.getElementById('deposit-tab')?.click()} 
              variant="outline" 
              className="w-full"
            >
              Add Funds
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="deposit" id="deposit-tab">Deposit Funds</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View your recent transactions and operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No transactions yet
                </div>
              ) : (
                <Table>
                  <TableCaption>Recent transactions</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{formatDate(tx.createdAt)}</TableCell>
                        <TableCell>
                          <span className={tx.status === 'pending' ? 'text-yellow-500' : 
                                          tx.status === 'failed' ? 'text-red-500' : ''}>
                            {tx.description}
                            {tx.status === 'pending' && ' (Pending)'}
                            {tx.status === 'failed' && ' (Failed)'}
                          </span>
                        </TableCell>
                        <TableCell className={tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(3)}
                        </TableCell>
                        <TableCell className="text-right">${tx.balanceAfter.toFixed(2)}</TableCell>
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
              <CardTitle>Deposit Funds</CardTitle>
              <CardDescription>
                Add money to your account to use for operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Deposit Amount (USD)</Label>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      min="5"
                      step="5"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Enter amount"
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
                    <strong>Operations Coverage:</strong>{' '}
                    {Math.floor(parseFloat(depositAmount || '0') / 0.005)} operations
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Each operation costs $0.005. Unused funds stay in your account.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleDeposit}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> 
                    Deposit with PayPal
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