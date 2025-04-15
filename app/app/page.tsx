// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to default language (English)
  redirect('/en');
}