// app/[lang]/dashboard/balance/cancel/page.tsx
import { Button } from "@/components/ui/button";
import { LanguageLink } from "@/components/language-link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { XCircle, Home, CreditCard } from "lucide-react";

export default function DepositCancelPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <XCircle className="h-6 w-6 mr-2 text-red-500" />
            Payment Cancelled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-2">
            <div className="bg-red-50 text-red-800 rounded-md p-4 mb-4">
              <p className="font-medium">Your deposit was cancelled</p>
              <p className="mt-2">
                The payment process was cancelled. No funds have been deducted
                from your account.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              You can try again at any time from your balance page.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <LanguageLink href={`/en/dashboard`}>
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </LanguageLink>
          <LanguageLink href={`/en/dashboard`}>
            <Button>
              <CreditCard className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </LanguageLink>
        </CardFooter>
      </Card>
    </div>
  );
}
