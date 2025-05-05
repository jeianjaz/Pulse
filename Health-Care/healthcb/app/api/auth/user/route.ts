import { API_URL } from '@/config/constants';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        createErrorResponse('Not authenticated', 401),
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/api/auth/user/`, {
      headers: { 'Authorization': `Token ${token}` }
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.error || 'Authentication failed', response.status),
        { status: response.status }
      );
    }

    return NextResponse.json(createSuccessResponse(data.data));
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      createErrorResponse('Authentication check failed'),
      { status: 500 }
    );
  }
}