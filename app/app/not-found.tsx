// app/not-found.tsx
import { redirect } from "next/navigation";

export default function NotFound() {
  // Redirect to the English 404 page for any unmatched routes
  redirect("/en/not-found");
}