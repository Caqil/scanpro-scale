// app/[lang]/admin/settings/page.tsx
import { Metadata } from "next";
import { SettingsContent } from "./settings-content";

export const metadata: Metadata = {
  title: "Settings | Admin Dashboard",
  description: "Configure system settings and preferences",
};

export default function SettingsPage() {
  return <SettingsContent />;
}
