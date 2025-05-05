import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

/**
 * POST /api/auth/change-password/
 * Change a user's password
 * Authentication: Required
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        createErrorResponse('Not authenticated', 401),
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.old_password || !body.new_password || !body.confirm_password) {
      return NextResponse.json(
        createErrorResponse('Missing required fields', 400),
        { status: 400 }
      );
    }

    // Validate that new password and confirm password match
    if (body.new_password !== body.confirm_password) {
      return NextResponse.json(
        createErrorResponse('New password and confirmation do not match', 400),
        { status: 400 }
      );
    }
    
    const response = await fetch(`${API_URL}/api/auth/change-password/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.detail || 'Failed to change password', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to change password'),
      { status: 500 }
    );
  }
}