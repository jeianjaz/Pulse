import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const response = await fetch(`${API_URL}/api/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.error || 'Login failed', response.status),
        { status: response.status }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set({
      name: 'auth_token',
      value: data.data.token,
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 10 * 60 * 60,
      path: '/',
      sameSite: 'strict',
    });

    return NextResponse.json(createSuccessResponse(data.data));
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      createErrorResponse('Login failed'),
      { status: 500 }
    );
  }
}