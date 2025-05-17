import { cookies } from 'next/headers';

export async function isAuthenticated() {
  const cookieStore = cookies();
  const token = (await cookieStore).get('authToken')?.value;
  
  if (!token) {
    return false;
  }
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_GO_API_URL}/api/auth/validate-token`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Auth validation error:', error);
    return false;
  }
}

export async function isAdmin() {
  const cookieStore = cookies();
  const token = (await cookieStore).get('authToken')?.value;
  
  if (!token) {
    return false;
  }
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_GO_API_URL}/api/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      return false;
    }
    
    const userData = await response.json();
    return userData.role === 'admin';
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}