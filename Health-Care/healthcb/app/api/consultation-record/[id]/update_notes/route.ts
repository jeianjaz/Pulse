import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

/**
 * PATCH /api/consultation-record/{id}/update_notes
 * Update consultation notes during the session
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    // Validate required fields
    if (!body.consultation_notes) {
      return NextResponse.json(
        createErrorResponse('Missing consultation_notes field', 400),
        { status: 400 }
      );
    }
    
    const response = await fetch(`${API_URL}/api/consultation-record/${id}/update_notes/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.detail || 'Failed to update consultation notes', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error('Update consultation notes error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to update consultation notes'),
      { status: 500 }
    );
  }
}