import { headers } from "next/headers";
import ResetPasswordContent from "./reset-password-content";

export default async function ResetPasswordPage() {
  const headersList = headers();
  const fullUrl = (await headersList).get("x-url") || "";

  console.log("Reset password page - Full URL:", fullUrl);

  // First try to get token from URL path segments (if format is /reset-password/<token>)
  let token: string | undefined;
  const pathSegments = fullUrl.split("/");

  // If the last segment doesn't contain "?", it might be the token
  const lastSegment = pathSegments[pathSegments.length - 1];
  if (lastSegment && !lastSegment.includes("?")) {
    token = lastSegment;
    console.log("Extracted token from path:", token);
  }

  // If not found in path, check query parameters
  if (!token) {
    // Extract token from URL using query parameters
    const urlParts = fullUrl.split("?");
    console.log("URL parts:", urlParts);

    const searchParams = new URLSearchParams(
      urlParts.length > 1 ? urlParts[1] : ""
    );
    const tokenParam = searchParams.get("token");
    console.log("Extracted token from query:", tokenParam);

    token = tokenParam || undefined;
  }

  console.log("Final token value:", token);

  return <ResetPasswordContent token={token} />;
}
