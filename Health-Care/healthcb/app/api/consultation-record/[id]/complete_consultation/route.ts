import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

/**
 * PATCH /api/consultation-record/{id}/complete_consultation
 * Complete a consultation session with diagnosis, treatment plan, etc.
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
    if (!body.diagnosis || !body.treatment_plan) {
      return NextResponse.json(
        createErrorResponse('Missing required fields: diagnosis and treatment_plan are required', 400),
        { status: 400 }
      );
    }
    
    const response = await fetch(`${API_URL}/api/consultation-record/${id}/complete_consultation/`, {
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
        createErrorResponse(data.detail || 'Failed to complete consultation', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error('Complete consultation error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to complete consultation'),
      { status: 500 }
    );
  }
}