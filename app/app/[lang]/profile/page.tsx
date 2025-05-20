"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoaderIcon } from "lucide-react";

export default function ProfilePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!isLoading && !isAuthenticated) {
      router.push("/en/login?callbackUrl=/profile");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="container max-w-4xl py-12 flex justify-center items-center min-h-[50vh]">
        <LoaderIcon className="h-8 w-8 text-primary animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <div className="bg-card p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Name
              </h3>
              <p>{user.name || "Not set"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Email
              </h3>
              <p>{user.email}</p>
              {!user.isEmailVerified && (
                <span className="text-xs text-amber-600 font-medium">
                  Not verified
                </span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Account Balance
            </h3>
            <p className="font-semibold">
              ${user.balance?.toFixed(2) || "0.00"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Free Operations
            </h3>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Free Operations
              </h3>
              <p>
                {user.freeOperationsRemaining || 0} remaining
                {user.freeOperationsReset ? (
                  <>
                    {" "}
                    (resets on{" "}
                    {new Date(user.freeOperationsReset).toLocaleDateString()})
                  </>
                ) : (
                  ""
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
