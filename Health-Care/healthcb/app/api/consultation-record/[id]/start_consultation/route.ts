import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

/**
 * POST /api/consultation-record/{id}/start_consultation
 * Start a consultation session and create/retrieve the consultation record
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
    
    const response = await fetch(`${API_URL}/api/consultation-record/${id}/start_consultation/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.detail || 'Failed to start consultation', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error('Start consultation error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to start consultation'),
      { status: 500 }
    );
  }
}