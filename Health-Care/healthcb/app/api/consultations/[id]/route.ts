import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

/**
 * GET /api/consultations/{id}
 * Get detailed view of a specific consultation
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    const response = await fetch(`${API_URL}/api/consultations/${id}`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.detail || 'Failed to fetch consultation details', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error('Consultation details fetch error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch consultation details'),
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/consultations/{id}
 * Update a consultation
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
    
    const response = await fetch(`${API_URL}/api/consultations/${id}`, {
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
        createErrorResponse(data.detail || 'Failed to update consultation', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error('Consultation update error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to update consultation'),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/consultations/{id}
 * Delete a consultation
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    const response = await fetch(`${API_URL}/api/consultations/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    
    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        createErrorResponse(data.detail || 'Failed to delete consultation', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse({ message: 'Consultation successfully deleted' }));
  } catch (error) {
    console.error('Consultation deletion error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to delete consultation'),
      { status: 500 }
    );
  }
}