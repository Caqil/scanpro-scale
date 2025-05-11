// app/[lang]/admin/subscriptions/page.tsx
import { Metadata } from "next";
import { SubscriptionsContent } from "./subscriptions-content";

export const metadata: Metadata = {
  title: "Subscription Management | Admin Dashboard",
  description: "Monitor and manage user subscriptions",
};

export default function SubscriptionsPage() {
  return <SubscriptionsContent />;
}
