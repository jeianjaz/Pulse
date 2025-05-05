import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (token) {
      await fetch(`${process.env._PROD}/api/auth/logout/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`
        }
      });
    }

    cookies().set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 0,
      path: '/',
      sameSite: 'strict',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    
    cookies().set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });

    return NextResponse.json({ success: true });
  }
}