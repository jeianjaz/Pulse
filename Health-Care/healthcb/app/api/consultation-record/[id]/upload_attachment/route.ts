import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

/**
 * POST /api/consultation-record/{id}/upload_attachment
 * Upload a file attachment to a consultation record
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
    
    // Parse the form data from the request
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        createErrorResponse('No file provided or invalid file', 400),
        { status: 400 }
      );
    }
    
    // Create a new FormData object to send to the backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    
    const response = await fetch(`${API_URL}/api/consultation-record/${id}/upload_attachment/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`
      },
      body: backendFormData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.detail || 'Failed to upload attachment', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error('Attachment upload error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to upload attachment'),
      { status: 500 }
    );
  }
}