import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

/**
 * GET /api/auth/update-profile/
 * Get a user's profile information
 * Authentication: Required
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        createErrorResponse('Not authenticated', 401),
        { status: 401 }
      );
    }
    
    const response = await fetch(`${API_URL}/api/auth/update-profile/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.detail || 'Failed to fetch profile', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse(data.data));
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch profile'),
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/update-profile/
 * Update a user's profile information
 * Authentication: Required
 */
export async function PUT(request: NextRequest) {
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
    
    const response = await fetch(`${API_URL}/api/auth/update-profile/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.detail || 'Failed to update profile', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to update profile'),
      { status: 500 }
    );
  }
}