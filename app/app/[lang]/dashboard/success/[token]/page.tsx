import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import ResetPasswordClient from "./reset-password-client";

// Use the most basic approach possible
export default function ResetPasswordPage(props: any) {
  const { lang, token } = props.params;
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Loading</CardTitle>
            <CardDescription className="text-center">
              Please wait while we load the reset password form
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    }>
      <ResetPasswordClient lang={lang} token={token} />
    </Suspense>
  );
}