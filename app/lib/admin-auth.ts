// lib/admin-auth.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function isAdminUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return false;
  }

  // Fetch user role from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });
  
  return user?.role === 'admin';
}

export async function requireAdmin() {
  const isAdmin = await isAdminUser();
  
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 403 }
    );
  }
  
  return null;
}

export async function withAdminAuth(handler: () => Promise<NextResponse>) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;
  
  try {
    return await handler();
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}