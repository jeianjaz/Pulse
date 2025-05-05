import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { API_URL } from '@/config/constants';

/**
 * GET /api/consultation-record/get_room_record
 * Get consultation record associated with a specific room ID
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
    
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('room');
    
    if (!roomId) {
      return NextResponse.json(
        createErrorResponse('Room ID is required', 400),
        { status: 400 }
      );
    }
    
    const response = await fetch(`${API_URL}/api/consultation-record/get_room_record/?room=${roomId}`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        createErrorResponse(data.detail || 'Failed to fetch consultation record for room', response.status),
        { status: response.status }
      );
    }
    
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error('Room record fetch error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch consultation record for room'),
      { status: 500 }
    );
  }
}