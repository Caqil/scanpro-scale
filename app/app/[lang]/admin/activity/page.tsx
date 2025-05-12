// app/[lang]/admin/activity/page.tsx
import { Metadata } from "next";
import { ActivityContent } from "./activity-content";

export const metadata: Metadata = {
  title: "Activity Logs | Admin Dashboard",
  description: "Monitor system and user activities",
};

export default function ActivityPage() {
  return <ActivityContent />;
}
