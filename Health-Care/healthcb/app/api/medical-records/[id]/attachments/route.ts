import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

/**
 * GET /api/medical-records/{id}/attachments
 * Get attachments for a specific medical record
 * Returns the attachment file or redirects to it
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        createErrorResponse('Not authenticated', 401),
        { status: 401 }
      );
    }
    
    const recordId = params.id;
    
    // Call the backend API to get attachment information
    const response = await fetch(
      `${API_URL}/api/consultation-record/${recordId}/attachments/`,
      {
        headers: {
          'Authorization': `Token ${token}`
        }
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.detail || 'Failed to fetch attachments', response.status),
        { status: response.status }
      );
    }

    // If there are attachments, we can either:
    // 1. Return JSON with attachment metadata (for displaying in our own viewer)
    // 2. Redirect to the actual file URL if the backend provides direct access
    // 3. Proxy the file content to the client
    
    if (data.attachments && data.attachments.length > 0) {
      const attachment = data.attachments[0]; // Get the first attachment
      
      // If the backend provides a direct URL, redirect to it
      if (attachment.file_url) {
        return NextResponse.redirect(attachment.file_url);
      }
      
      // Otherwise, return the attachment data for handling on the client
      return NextResponse.json(createSuccessResponse({
        file_name: attachment.file_name,
        file_type: attachment.file_type,
        id: attachment.id,
        // The frontend can display a viewer or download link based on this info
      }));
    }
    
    return NextResponse.json(
      createSuccessResponse({ message: 'No attachments found' })
    );
    
  } catch (error) {
    console.error('Attachment fetch error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch attachments'),
      { status: 500 }
    );
  }
}