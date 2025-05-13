// app/[lang]/admin/transactions/page.tsx
import { Metadata } from "next";
import { TransactionsContent } from "./TransactionsContent";

export const metadata: Metadata = {
  title: "Transaction Management | Admin Dashboard",
  description: "Monitor and manage user transactions",
};

export default function TransactionsPage() {
  return <TransactionsContent />;
}
