// app/[lang]/profile/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserProfile } from "@/components/user-profile";
import { authOptions } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/en/login?callbackUrl=/profile");
  }
  
  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });
  
  if (!user) {
    redirect("/en/login");
  }
  
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <UserProfile user={user} />
    </div>
  );
}