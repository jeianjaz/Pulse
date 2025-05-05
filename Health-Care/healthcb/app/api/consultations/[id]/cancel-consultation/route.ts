import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

/**
 * POST /api/consultations/{id}/cancel-consultation
 * Cancel a consultation
 * Permission: IsAuthenticated (with role-based checks)
 * Makes availability slot available again
 * Updates consultation request status
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        createErrorResponse('Not authenticated', 401),
        { status: 401 }
      );
    }
    
    const { id } = params;
    const body = await request.json();
    
    const response = await fetch(`${API_URL}/api/consultations/${id}/cancel-consultation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        createErrorResponse(data.detail || 'Failed to cancel consultation', response.status),
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error('Cancel consultation error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to cancel consultation'),
      { status: 500 }
    );
  }
}