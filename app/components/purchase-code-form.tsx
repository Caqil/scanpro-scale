// components/purchase-code-form.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Copy, CheckCircle, XCircle } from 'lucide-react';

export function PurchaseCodeForm() {
  const [purchaseCode, setPurchaseCode] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Validate form
  const validateForm = (): boolean => {
    if (!purchaseCode.trim()) {
      setError("Purchase code is required");
      return false;
    }

    // Basic purchase code format validation for Envato
    // Format is typically like: 5cb8e278-a516-48ee-9d41-95a91c3f5aa3
    const codePattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    if (!codePattern.test(purchaseCode.trim())) {
      setError("Invalid purchase code format. It should look like: 5cb8e278-a516-48ee-9d41-95a91c3f5aa3");
      return false;
    }

    if (!email.trim()) {
      setError("Email is required");
      return false;
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setError("Invalid email format");
      return false;
    }

    setError(null);
    return true;
  };

  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setSuccess(false);
    setApiKey(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Submit form
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/validate-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purchaseCode: purchaseCode.trim(),
          email: email.trim(),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to validate purchase code');
        return;
      }
      
      // Success!
      setSuccess(true);
      if (data.apiKey?.key) {
        setApiKey(data.apiKey.key);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error validating purchase code:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy API key to clipboard
  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
        .then(() => {
          alert('API key copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          alert('Failed to copy to clipboard. Please select and copy manually.');
        });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Validate Your Purchase</CardTitle>
        </div>
        <CardDescription>
          Enter your CodeCanyon purchase code to get your API key
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && apiKey ? (
          <div className="space-y-4">
            <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-300">Success!</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                Your purchase has been validated successfully. Your API key is ready to use.
              </AlertDescription>
            </Alert>
            
            <div className="mt-4">
              <Label htmlFor="api-key">Your API Key</Label>
              <div className="flex mt-1.5">
                <Input
                  id="api-key"
                  value={apiKey}
                  readOnly
                  className="font-mono text-sm flex-1 bg-muted/30"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  className="ml-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Store this API key securely and include it in all your API requests.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purchase-code">Purchase Code</Label>
              <Input
                id="purchase-code"
                value={purchaseCode}
                onChange={(e) => setPurchaseCode(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Your CodeCanyon purchase code can be found in your Envato downloads page
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Must match the email used for the purchase
              </p>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Validating...' : 'Validate Purchase'}
            </Button>
          </form>
        )}
      </CardContent>
      
      {success && (
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-xs text-center text-muted-foreground">
            Keep your API key secure and don't share it with others. Include this key in all your API requests.
          </p>
        </CardFooter>
      )}
    </Card>
  );
}