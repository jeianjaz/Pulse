import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

/**
 * POST /api/conversation/token
 * Get a token for Twilio Conversations with optional auto-creation
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
    
    if (!body.identity) {
      return NextResponse.json(
        createErrorResponse('Identity is required', 400),
        { status: 400 }
      );
    }
    
    // Format identity for backend if needed
    const formattedIdentity = body.identity;
    
    // Forward the request to your backend
    const response = await fetch(`${API_URL}/api/conversation/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({
        identity: formattedIdentity,
        display_name: body.displayName || formattedIdentity,
        room: body.room || null,
        auto_create: body.auto_create || false,
        user_type: body.userType || 'patient'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.error || 'Failed to get token', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error('Token retrieval error');
    return NextResponse.json(
      createErrorResponse('Failed to get conversation token'),
      { status: 500 }
    );
  }
}
