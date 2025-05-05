import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

/**
 * PATCH /api/consultation-request/{id}/update_status
 * Update the status of a consultation request (approve or reject)
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
    if (!body.status || !['approved', 'rejected'].includes(body.status)) {
      return NextResponse.json(
        createErrorResponse('Invalid status value. Must be "approved" or "rejected"', 400),
        { status: 400 }
      );
    }
    
    const response = await fetch(`${API_URL}/api/consultation-request/${id}/update_status/`, {
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
        createErrorResponse(data.detail || 'Failed to update request status', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error('Update request status error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to update request status'),
      { status: 500 }
    );
  }
}