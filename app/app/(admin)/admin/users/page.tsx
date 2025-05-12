// app/[lang]/admin/users/page.tsx
import { Metadata } from "next";
import { AdminUsersContent } from "./users-content";

export const metadata: Metadata = {
  title: "User Management | Admin Dashboard",
  description: "Manage users and their permissions",
};

export default function AdminUsersPage() {
  return <AdminUsersContent />;
}