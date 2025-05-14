import { Metadata } from "next";
import { headers } from "next/headers";
import { SuccessClient } from "./success-client";

export const metadata: Metadata = {
  title: "Deposit Success | MegaPDF",
  description:
    "Confirmation of your successful deposit to your MegaPDF account.",
};

export default async function DepositSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await searchParams to resolve the Promise
  const resolvedSearchParams = await searchParams;

  // First, try to get token from searchParams (most reliable method)
  let token: string | null = null;

  // Check if token exists in searchParams
  if (resolvedSearchParams && "token" in resolvedSearchParams) {
    const tokenParam = resolvedSearchParams.token;
    if (typeof tokenParam === "string") {
      token = tokenParam;
      console.log("Found token in searchParams:", token);
    }
  }

  // If token not found in searchParams, try to extract from URL
  if (!token) {
    const headersList = headers();
    const fullUrl = (await headersList).get("x-url") || "";
    console.log("Full URL from headers:", fullUrl);

    // Extract token from query string if present
    if (fullUrl && fullUrl.includes("?")) {
      const queryString = fullUrl.split("?")[1];
      const params = new URLSearchParams(queryString);
      token = params.get("token");
      console.log("Extracted token from URL query string:", token);
    }

    // If still no token, try to extract from path
    if (!token && fullUrl) {
      const pathSegments = fullUrl.split("/");
      const lastSegment = pathSegments[pathSegments.length - 1];

      // Check if last segment doesn't contain query parameters and could be a token
      if (lastSegment && !lastSegment.includes("?")) {
        token = lastSegment;
        console.log("Extracted token from URL path:", token);
      }
    }
  }

  // Extract PayerID if present (useful for PayPal verification)
  let payerId: string | null = null;
  if (resolvedSearchParams && "PayerID" in resolvedSearchParams) {
    const payerIdParam = resolvedSearchParams.PayerID;
    if (typeof payerIdParam === "string") {
      payerId = payerIdParam;
    }
  }

  console.log("Final token to be used:", token);
  console.log("PayerID:", payerId);

  return <SuccessClient initialToken={token} payerId={payerId} />;
}
