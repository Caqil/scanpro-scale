import { Metadata } from "next";
import { AdminDashboardContent } from "./admin-content";

export const metadata: Metadata = {
  title: "Admin Dashboard | MegaPDF",
  description: "Administrative dashboard for MegaPDF",
};

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}
