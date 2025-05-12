import { redirect } from "next/navigation";

// Redirect to dashboard by default
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
